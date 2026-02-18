import { spawn, spawnSync } from 'node:child_process';
import { closeSync, mkdirSync, openSync } from 'node:fs';
import { dirname } from 'node:path';

import { AGENT_COMMAND_MAP } from '../constants.mjs';
import { fail } from '../errors.mjs';

function resolveMaxBufferBytes() {
  const raw = Number(process.env.UI_COMPONENTS_COMMAND_MAX_BUFFER_BYTES);
  if (Number.isFinite(raw) && raw > 0) {
    return Math.trunc(raw);
  }
  return 256 * 1024 * 1024;
}

function runCommandInternal(command, args, options = {}) {
  const {
    cwd = process.cwd(),
    timeoutMs = 60_000,
    allowFailure = false,
    shell = false,
    env = process.env,
    detached = false,
  } = options;
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    timeout: timeoutMs,
    maxBuffer: resolveMaxBufferBytes(),
    shell,
    env,
    detached,
    stdio: ['ignore', 'pipe', 'pipe'],
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

function shellEscape(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function runShellCommand(commandLine, options = {}) {
  return runCommandInternal('zsh', ['-lic', commandLine], options);
}

function buildAgentCommandLine(agentRuntime, commandArgs) {
  const allArgs = [...agentRuntime.args, ...commandArgs];
  return `${agentRuntime.command} ${allArgs.map((part) => shellEscape(part)).join(' ')}`.trim();
}

export function runCommand(command, args, options = {}) {
  return runCommandInternal(command, args, options);
}

export function runDetachedCommand(command, args, options = {}) {
  const {
    cwd = process.cwd(),
    shell = false,
    env = process.env,
    stdoutPath = null,
    stderrPath = null,
  } = options;
  let stdoutFd = null;
  let stderrFd = null;
  try {
    if (stdoutPath) {
      mkdirSync(dirname(stdoutPath), { recursive: true });
      stdoutFd = openSync(stdoutPath, 'a');
    }
    if (stderrPath) {
      mkdirSync(dirname(stderrPath), { recursive: true });
      stderrFd = openSync(stderrPath, 'a');
    }

    const child = spawn(command, args, {
      cwd,
      shell,
      env,
      detached: true,
      stdio: ['ignore', stdoutFd ?? 'ignore', stderrFd ?? stdoutFd ?? 'ignore'],
    });
    child.unref();
    return {
      pid: Number.isFinite(child.pid) ? child.pid : null,
    };
  } catch (error) {
    fail(
      `Detached command failed (${command} ${args.join(' ')}): ${error instanceof Error ? error.message : String(error)}`
    );
  } finally {
    if (typeof stdoutFd === 'number') {
      closeSync(stdoutFd);
    }
    if (typeof stderrFd === 'number' && stderrFd !== stdoutFd) {
      closeSync(stderrFd);
    }
  }
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

export function resolveAgentRuntime(scenario) {
  const fallbackCommand = AGENT_COMMAND_MAP[scenario.engine];
  if (!fallbackCommand) {
    fail(
      `Unsupported agent engine: ${scenario.engine}. Only 'codex' is supported.`
    );
  }

  const fallbackCommands =
    scenario.engine === 'codex'
      ? ['codexf', fallbackCommand]
      : [fallbackCommand];
  const commandCandidates = fallbackCommands;
  const args = [];

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

export function runAgentCommand(agentRuntime, commandArgs, options = {}) {
  const allArgs = [...agentRuntime.args, ...commandArgs];
  const commandLine = buildAgentCommandLine(agentRuntime, commandArgs);
  const runOptions = {
    ...options,
    detached: true,
  };

  if (agentRuntime.mode === 'binary') {
    const result = runCommandInternal(
      agentRuntime.command,
      allArgs,
      runOptions
    );
    return {
      ...result,
      commandLine,
    };
  }

  const result = runShellCommand(commandLine, runOptions);
  return {
    ...result,
    commandLine,
  };
}
