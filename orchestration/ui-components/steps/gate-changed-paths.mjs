import { getChangedFiles, matchesPattern } from '../lib/git-gates.mjs';
import { fail } from '../lib/errors.mjs';

export function stepGateChangedPaths(context) {
  if (context.options.dryRun) {
    return {
      skipped: true,
      reason: '--dry-run option',
    };
  }

  const allowedPatterns = context.scenario.gates.allowedChangedPaths;
  if (allowedPatterns.length === 0) {
    return {
      skipped: true,
      reason: 'no `gates.allowed_changed_paths` configured',
    };
  }

  const currentChangedFiles = getChangedFiles(context.rootPath);
  const newChangedFiles = [...currentChangedFiles].filter(
    (path) => !context.initialChangedFiles.has(path)
  );

  const violations = newChangedFiles.filter(
    (path) => !matchesPattern(path, allowedPatterns)
  );
  if (violations.length > 0) {
    fail(`Changed files outside allowed paths: ${violations.join(', ')}`);
  }

  context.newChangedFiles = newChangedFiles;
  return {
    checkedFiles: newChangedFiles.length,
    allowedPatterns,
  };
}
