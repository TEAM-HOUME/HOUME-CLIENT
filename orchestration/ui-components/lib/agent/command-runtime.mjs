import { spawnSync } from 'node:child_process';

import { AGENT_COMMAND_MAP } from '../constants.mjs';
import { fail } from '../errors.mjs';

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
    maxBuffer: 10 * 1024 * 1024,
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
