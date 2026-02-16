import { dirname } from 'node:path';

import { getChangedFiles, matchesPattern } from '../lib/git-gates.mjs';
import { fail } from '../lib/errors.mjs';

function toDirectoryPattern(path) {
  if (!path) {
    return null;
  }
  const normalized = String(path).replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized.includes('/')) {
    return null;
  }
  return `${dirname(normalized)}/**`;
}

function resolveAllowedPatterns(context) {
  const configured = context.scenario.gates.allowedChangedPaths;
  if (configured.length > 0) {
    return configured;
  }

  const inferred = [
    toDirectoryPattern(context.componentPlan?.targetPath),
    context.componentPlan?.storyPath || null,
    ...context.scenario.targets,
  ].filter(Boolean);
  return [...new Set(inferred)];
}

export function stepGateChangedPaths(context) {
  if (context.options.dryRun) {
    return {
      skipped: true,
      reason: '--dry-run option',
    };
  }

  const allowedPatterns = resolveAllowedPatterns(context);
  if (allowedPatterns.length === 0) {
    return {
      skipped: true,
      reason: 'no allowed paths inferred',
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
