import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { fail } from '../lib/errors.mjs';

const STORY_FILE_PATTERN = /\.stories\.(?:[cm]?[jt]sx?)$/;
const DESIGN_URL_PATTERN =
  /design\s*:\s*{[\s\S]*?url\s*:\s*['"`]https?:\/\/[^'"`]+['"`]/m;

function hasPersistentDesignUrl(content) {
  return DESIGN_URL_PATTERN.test(content);
}

export function stepGateStoryDesignLinks(context) {
  if (context.options.dryRun) {
    return {
      skipped: true,
      reason: '--dry-run option',
    };
  }

  if (!context.scenario.gates.requireStoryDesignUrl) {
    return {
      skipped: true,
      reason: '`gates.require_story_design_url` is disabled',
    };
  }

  const changedStoryFiles = context.newChangedFiles.filter((filePath) =>
    STORY_FILE_PATTERN.test(filePath)
  );
  if (changedStoryFiles.length === 0) {
    return {
      skipped: true,
      reason: 'no changed story files',
    };
  }

  const violations = [];

  for (const filePath of changedStoryFiles) {
    const absolutePath = resolve(context.rootPath, filePath);
    if (!existsSync(absolutePath)) {
      violations.push(`${filePath} (file missing)`);
      continue;
    }

    const content = readFileSync(absolutePath, 'utf8');
    if (!hasPersistentDesignUrl(content)) {
      violations.push(filePath);
    }
  }

  if (violations.length > 0) {
    fail(
      `Missing Storybook design URL (parameters.design.url): ${violations.join(', ')}`
    );
  }

  return {
    checkedStories: changedStoryFiles.length,
    status: 'passed',
  };
}
