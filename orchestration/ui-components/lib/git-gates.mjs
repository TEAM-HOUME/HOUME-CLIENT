import { runCommand } from './agent.mjs';

export function getChangedFiles(rootPath) {
  const unstaged = runCommand('git', ['diff', '--name-only'], {
    cwd: rootPath,
  }).stdout;
  const staged = runCommand('git', ['diff', '--cached', '--name-only'], {
    cwd: rootPath,
  }).stdout;
  const untracked = runCommand(
    'git',
    ['ls-files', '--others', '--exclude-standard'],
    {
      cwd: rootPath,
    }
  ).stdout;

  return new Set(
    `${unstaged}\n${staged}\n${untracked}`
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
  );
}

function globToRegex(globPattern) {
  const escaped = globPattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '__DOUBLE_STAR__')
    .replace(/\*/g, '[^/]*')
    .replace(/__DOUBLE_STAR__/g, '.*');

  return new RegExp(`^${escaped}$`);
}

export function matchesPattern(path, patterns) {
  return patterns.some((pattern) => globToRegex(pattern).test(path));
}
