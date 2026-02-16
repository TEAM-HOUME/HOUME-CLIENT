import { spawnSync } from 'node:child_process';

import { fail } from './errors.mjs';

export function runCommand(command, args, options = {}) {
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

export function hasCommand(command) {
  const result = runCommand('which', [command], { allowFailure: true });
  return result.exitCode === 0;
}

export function hasAlias(command) {
  const result = runCommand('zsh', ['-ic', `alias ${command}`], {
    allowFailure: true,
    timeoutMs: 10_000,
  });
  return result.exitCode === 0;
}

export function shellEscape(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

export function runShellCommand(commandLine, options = {}) {
  return runCommand('zsh', ['-lic', commandLine], options);
}
