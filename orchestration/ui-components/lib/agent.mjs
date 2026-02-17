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
    env = process.env,
  } = options;
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    timeout: timeoutMs,
    maxBuffer: 10 * 1024 * 1024,
    shell,
    env,
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

  const fallbackCommands =
    scenario.engine === 'codex'
      ? ['codexf', fallbackCommand]
      : [fallbackCommand];
  const commandCandidates = scenario.agent.command
    ? [scenario.agent.command]
    : fallbackCommands;
  const args = scenario.agent.args || [];

  for (const command of commandCandidates) {
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
  }

  fail(`Missing required command or alias: ${commandCandidates.join(', ')}`);
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

function toFiniteNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return null;
  }
  return number;
}

function normalizeUsageObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const inputTokens =
    toFiniteNumber(value.input_tokens) ??
    toFiniteNumber(value.prompt_tokens) ??
    toFiniteNumber(value.inputTokens) ??
    toFiniteNumber(value.promptTokens);

  const outputTokens =
    toFiniteNumber(value.output_tokens) ??
    toFiniteNumber(value.completion_tokens) ??
    toFiniteNumber(value.outputTokens) ??
    toFiniteNumber(value.completionTokens);

  let totalTokens =
    toFiniteNumber(value.total_tokens) ?? toFiniteNumber(value.totalTokens);
  if (totalTokens === null && (inputTokens !== null || outputTokens !== null)) {
    totalTokens = (inputTokens ?? 0) + (outputTokens ?? 0);
  }

  if (inputTokens === null && outputTokens === null && totalTokens === null) {
    return null;
  }

  return {
    inputTokens,
    outputTokens,
    totalTokens,
  };
}

function extractUsageFromValue(value, depth = 0) {
  if (!value || depth > 5) {
    return null;
  }

  const directUsage = normalizeUsageObject(value);
  if (directUsage) {
    return directUsage;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const usage = extractUsageFromValue(item, depth + 1);
      if (usage) {
        return usage;
      }
    }
    return null;
  }

  if (typeof value === 'object') {
    const usageKeyCandidates = [
      'usage',
      'token_usage',
      'tokenUsage',
      'metrics',
    ];
    for (const key of usageKeyCandidates) {
      if (!(key in value)) {
        continue;
      }
      const usage = extractUsageFromValue(value[key], depth + 1);
      if (usage) {
        return usage;
      }
    }

    for (const nestedValue of Object.values(value)) {
      if (!nestedValue || typeof nestedValue !== 'object') {
        continue;
      }
      const usage = extractUsageFromValue(nestedValue, depth + 1);
      if (usage) {
        return usage;
      }
    }
  }

  return null;
}

function parseAgentOutput(text) {
  const envelope = extractFirstJson(text);
  if (!envelope) {
    return {
      parsed: null,
      usage: null,
      envelope: null,
    };
  }

  let parsed = envelope;
  if (
    envelope &&
    typeof envelope === 'object' &&
    !Array.isArray(envelope) &&
    'result' in envelope
  ) {
    const resultValue = envelope.result;
    if (typeof resultValue === 'string') {
      parsed = extractFirstJson(resultValue);
    } else if (
      resultValue &&
      typeof resultValue === 'object' &&
      !Array.isArray(resultValue)
    ) {
      parsed = resultValue;
    } else {
      parsed = null;
    }
  }

  const usage = extractUsageFromValue(envelope);
  return {
    parsed,
    usage,
    envelope,
  };
}

function parseJsonLinesEvents(text) {
  const lines = String(text ?? '').split(/\r?\n/);
  const events = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }
    try {
      events.push(JSON.parse(trimmed));
    } catch {
      // Non-JSON line
    }
  }

  return events;
}

function extractAgentMessageText(item) {
  if (!item || typeof item !== 'object') {
    return '';
  }

  if (typeof item.text === 'string' && item.text.trim()) {
    return item.text;
  }

  if (!Array.isArray(item.content)) {
    return '';
  }

  const textParts = item.content
    .map((entry) => {
      if (typeof entry === 'string') {
        return entry;
      }
      if (!entry || typeof entry !== 'object') {
        return '';
      }
      if (typeof entry.text === 'string') {
        return entry.text;
      }
      if (typeof entry.content === 'string') {
        return entry.content;
      }
      return '';
    })
    .filter(Boolean);

  return textParts.join('\n');
}

function parseCodexJsonOutput(text) {
  const events = parseJsonLinesEvents(text);
  if (events.length === 0) {
    return parseAgentOutput(text);
  }

  let usage = null;
  let parsed = null;
  let envelope = events[events.length - 1] ?? null;

  for (const event of events) {
    const eventUsage = extractUsageFromValue(event);
    if (eventUsage) {
      usage = eventUsage;
    }
  }

  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index];
    const item = event?.item;
    if (!item || item.type !== 'agent_message') {
      continue;
    }

    const messageText = extractAgentMessageText(item);
    if (!messageText) {
      continue;
    }

    const candidate = extractFirstJson(messageText);
    if (
      !candidate ||
      typeof candidate !== 'object' ||
      Array.isArray(candidate)
    ) {
      continue;
    }

    parsed = candidate;
    envelope = event;
    break;
  }

  if (!parsed) {
    const fallback = parseAgentOutput(text);
    return {
      parsed: fallback.parsed,
      usage: usage ?? fallback.usage,
      envelope: fallback.envelope ?? envelope,
    };
  }

  return {
    parsed,
    usage,
    envelope,
  };
}

export function parseAgentJsonOutput(text) {
  const output = parseAgentOutput(text);
  if (!output.parsed) {
    return null;
  }

  if (typeof output.parsed !== 'object' || Array.isArray(output.parsed)) {
    return null;
  }

  return output.parsed;
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
    usage: trace.usage ?? null,
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
    usage: trace.usage ?? null,
  };
  context.agentTraceArtifacts.push(record);
  return record;
}

function ensureAgentTokenUsage(context) {
  if (context.agentTokenUsage) {
    return context.agentTokenUsage;
  }
  context.agentTokenUsage = {
    records: [],
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalTokens: 0,
    missingCount: 0,
  };
  return context.agentTokenUsage;
}

function recordAgentTokenUsage(context, purpose, usage) {
  const summary = ensureAgentTokenUsage(context);
  const hasUsage =
    usage &&
    (usage.inputTokens !== null ||
      usage.outputTokens !== null ||
      usage.totalTokens !== null);

  if (!hasUsage) {
    summary.missingCount += 1;
    summary.records.push({
      purpose,
      inputTokens: null,
      outputTokens: null,
      totalTokens: null,
    });
    return;
  }

  summary.totalInputTokens += usage.inputTokens ?? 0;
  summary.totalOutputTokens += usage.outputTokens ?? 0;
  summary.totalTokens += usage.totalTokens ?? 0;
  summary.records.push({
    purpose,
    inputTokens: usage.inputTokens ?? null,
    outputTokens: usage.outputTokens ?? null,
    totalTokens: usage.totalTokens ?? null,
  });
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
        '--json',
        '--output-schema',
        schemaPath,
        prompt,
      ],
      {
        cwd: context.rootPath,
        timeoutMs,
      }
    );

    const parsedOutput = parseCodexJsonOutput(result.stdout);
    const parsed = parsedOutput.parsed;
    recordAgentTrace(context, {
      purpose,
      commandLine: result.commandLine,
      timeoutMs,
      prompt,
      schema,
      stdout: result.stdout,
      stderr: result.stderr,
      parsed,
      usage: parsedOutput.usage,
      status: parsed ? 'parsed' : 'parse_failed',
    });
    recordAgentTokenUsage(context, purpose, parsedOutput.usage);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
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

    const parsedOutput = parseAgentOutput(result.stdout);
    const parsed = parsedOutput.parsed;
    recordAgentTrace(context, {
      purpose,
      commandLine: result.commandLine,
      timeoutMs,
      prompt,
      schema,
      stdout: result.stdout,
      stderr: result.stderr,
      parsed,
      usage: parsedOutput.usage,
      status: parsed ? 'parsed' : 'parse_failed',
    });
    recordAgentTokenUsage(context, purpose, parsedOutput.usage);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      fail(
        `Unable to parse JSON output from claude (${purpose}). Output: ${result.stdout.slice(0, 400)}`
      );
    }
    return parsed;
  }

  fail(`Unsupported engine for agent invocation: ${context.scenario.engine}`);
}
