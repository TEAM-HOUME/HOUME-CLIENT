import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { AGENT_COMMAND_MAP, CODEX_SAFE_CONFIG } from './constants.mjs';
import { fail } from './errors.mjs';

function runCommandInternal(command, args, options = {}) {
  const {
    cwd = process.cwd(),
    timeoutMs = 60_000,
    allowFailure = false,
    shell = false,
  } = options;
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    timeout: timeoutMs,
    maxBuffer: 10 * 1024 * 1024,
    shell,
  });

  const stdout = result.stdout?.trim() ?? '';
  const stderr = result.stderr?.trim() ?? '';
  const exitCode = result.status ?? 1;

  if (result.error) {
    if (allowFailure) {
      return { exitCode, stdout, stderr, error: result.error };
    }
    if (result.error.message.includes('ETIMEDOUT')) {
      fail(`Command timed out after ${timeoutMs}ms: ${command}`);
    }
    fail(`Command failed to execute: ${command} (${result.error.message})`);
  }

  if (exitCode !== 0 && !allowFailure) {
    fail(
      `Command failed (${command} ${args.join(' ')}): ${stderr || stdout || `exit code ${exitCode}`}`
    );
  }

  return { exitCode, stdout, stderr, error: null };
}

export function runCommand(command, args, options = {}) {
  return runCommandInternal(command, args, options);
}

export function hasCommand(command) {
  const result = runCommandInternal('which', [command], { allowFailure: true });
  return result.exitCode === 0;
}

export function hasAlias(command) {
  const result = runCommandInternal('zsh', ['-ic', `alias ${command}`], {
    allowFailure: true,
    timeoutMs: 10_000,
  });
  return result.exitCode === 0;
}

function shellEscape(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function runShellCommand(commandLine, options = {}) {
  return runCommandInternal('zsh', ['-lic', commandLine], options);
}

export function resolveAgentRuntime(scenario) {
  const fallbackCommand = AGENT_COMMAND_MAP[scenario.engine];
  if (!fallbackCommand) {
    fail(`Unsupported agent.engine: ${scenario.engine}`);
  }

  const command = scenario.agent.command || fallbackCommand;
  const args = scenario.agent.args || [];

  if (hasCommand(command)) {
    return {
      command,
      args,
      mode: 'binary',
    };
  }

  if (hasAlias(command)) {
    return {
      command,
      args,
      mode: 'alias',
    };
  }

  fail(`Missing required command or alias: ${command}`);
}

function buildAgentCommandLine(agentRuntime, commandArgs) {
  const allArgs = [...agentRuntime.args, ...commandArgs];
  return `${agentRuntime.command} ${allArgs.map((part) => shellEscape(part)).join(' ')}`.trim();
}

export function runAgentCommand(agentRuntime, commandArgs, options = {}) {
  const allArgs = [...agentRuntime.args, ...commandArgs];
  const commandLine = buildAgentCommandLine(agentRuntime, commandArgs);

  if (agentRuntime.mode === 'binary') {
    const result = runCommandInternal(agentRuntime.command, allArgs, options);
    return {
      ...result,
      commandLine,
    };
  }

  const result = runShellCommand(commandLine, options);
  return {
    ...result,
    commandLine,
  };
}

function extractFirstJson(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    // Fallback scan
  }

  const start = trimmed.indexOf('{');
  if (start === -1) {
    return null;
  }

  let depth = 0;
  for (let i = start; i < trimmed.length; i += 1) {
    const char = trimmed[i];
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
    if (depth === 0) {
      const candidate = trimmed.slice(start, i + 1);
      try {
        return JSON.parse(candidate);
      } catch {
        return null;
      }
    }
  }

  return null;
}

export function parseAgentJsonOutput(text) {
  const parsed = extractFirstJson(text);
  if (!parsed) {
    return null;
  }

  if (typeof parsed.result === 'string') {
    const nested = extractFirstJson(parsed.result);
    if (nested) {
      return nested;
    }
  }

  return parsed;
}

function ensureAgentTraceDir(context) {
  const dirPath = resolve(context.artifactsDir, context.runId, 'agent-trace');
  mkdirSync(dirPath, { recursive: true });
  return dirPath;
}

function writeArtifact(filePath, content) {
  if (content === null || content === undefined) {
    return;
  }
  const serialized =
    typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  writeFileSync(filePath, serialized, 'utf8');
}

function recordAgentTrace(context, trace) {
  const traceDir = ensureAgentTraceDir(context);
  const traceIndex = String(context.agentTraceArtifacts.length + 1).padStart(
    2,
    '0'
  );
  const safePurpose = trace.purpose.replace(/[^a-z0-9-_]/gi, '_').toLowerCase();
  const baseName = `${traceIndex}-${safePurpose}`;

  const metadataPath = resolve(traceDir, `${baseName}.meta.json`);
  const promptPath = resolve(traceDir, `${baseName}.prompt.md`);
  const stdoutPath = resolve(traceDir, `${baseName}.stdout.txt`);
  const stderrPath = resolve(traceDir, `${baseName}.stderr.txt`);
  const parsedPath = resolve(traceDir, `${baseName}.parsed.json`);

  writeArtifact(metadataPath, {
    purpose: trace.purpose,
    engine: context.scenario.engine,
    commandLine: trace.commandLine,
    timeoutMs: trace.timeoutMs,
    schema: trace.schema,
    status: trace.status,
  });
  writeArtifact(promptPath, trace.prompt);
  writeArtifact(stdoutPath, trace.stdout ?? '');
  writeArtifact(stderrPath, trace.stderr ?? '');
  if (trace.parsed !== null && trace.parsed !== undefined) {
    writeArtifact(parsedPath, trace.parsed);
  }

  const record = {
    purpose: trace.purpose,
    status: trace.status,
    metadataPath: relative(context.rootPath, metadataPath),
    promptPath: relative(context.rootPath, promptPath),
    stdoutPath: relative(context.rootPath, stdoutPath),
    stderrPath: relative(context.rootPath, stderrPath),
    parsedPath:
      trace.parsed !== null && trace.parsed !== undefined
        ? relative(context.rootPath, parsedPath)
        : null,
  };
  context.agentTraceArtifacts.push(record);
  return record;
}

export function invokeAgentWithSchema(
  context,
  purpose,
  prompt,
  schema,
  timeoutMs,
  options = {}
) {
  const claudePermissionMode = options.claudePermissionMode || 'plan';

  if (context.scenario.engine === 'codex') {
    const schemaPath = resolve(
      context.artifactsDir,
      `${context.runId}-${purpose}-schema.json`
    );
    writeFileSync(schemaPath, JSON.stringify(schema), 'utf8');

    const result = runAgentCommand(
      context.agentRuntime,
      [
        '-a',
        'never',
        ...CODEX_SAFE_CONFIG,
        'exec',
        '-C',
        context.rootPath,
        '--output-schema',
        schemaPath,
        prompt,
      ],
      {
        cwd: context.rootPath,
        timeoutMs,
      }
    );

    const parsed = parseAgentJsonOutput(result.stdout);
    recordAgentTrace(context, {
      purpose,
      commandLine: result.commandLine,
      timeoutMs,
      prompt,
      schema,
      stdout: result.stdout,
      stderr: result.stderr,
      parsed,
      status: parsed ? 'parsed' : 'parse_failed',
    });

    if (!parsed) {
      fail(
        `Unable to parse JSON output from codex (${purpose}). Output: ${result.stdout.slice(0, 400)}`
      );
    }
    return parsed;
  }

  if (context.scenario.engine === 'claude') {
    const result = runAgentCommand(
      context.agentRuntime,
      [
        '-p',
        '--output-format',
        'json',
        '--json-schema',
        JSON.stringify(schema),
        '--permission-mode',
        claudePermissionMode,
        '--add-dir',
        context.rootPath,
        prompt,
      ],
      {
        cwd: context.rootPath,
        timeoutMs,
      }
    );

    const parsed = parseAgentJsonOutput(result.stdout);
    recordAgentTrace(context, {
      purpose,
      commandLine: result.commandLine,
      timeoutMs,
      prompt,
      schema,
      stdout: result.stdout,
      stderr: result.stderr,
      parsed,
      status: parsed ? 'parsed' : 'parse_failed',
    });

    if (!parsed) {
      fail(
        `Unable to parse JSON output from claude (${purpose}). Output: ${result.stdout.slice(0, 400)}`
      );
    }
    return parsed;
  }

  fail(`Unsupported engine for agent invocation: ${context.scenario.engine}`);
}
