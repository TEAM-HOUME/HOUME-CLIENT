import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { fail } from './errors.mjs';

const DEFAULT_UI_RULE_DOCS = [
  'docs/reference/ui-component-design-conventions.md',
  'docs/reference/styling-system.md',
  'docs/reference/component-catalog.md',
];
const DEFAULT_REQUIRED_VIEWPORTS = ['mobile375', 'mobile440'];

function resolveUiRuleDocPaths(rootPath) {
  const missing = DEFAULT_UI_RULE_DOCS.filter(
    (path) => !existsSync(resolve(rootPath, path))
  );

  if (missing.length > 0) {
    fail(`UI rule docs not found: ${missing.join(', ')}`);
  }

  return DEFAULT_UI_RULE_DOCS.map((path) => resolve(rootPath, path));
}

function extractRequiredViewports(content) {
  const lines = content.split(/\r?\n/);
  const viewports = [];
  let inSection = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!inSection) {
      if (/^required_storybook_viewports:\s*$/i.test(trimmed)) {
        inSection = true;
      }
      continue;
    }

    if (!trimmed) {
      continue;
    }
    if (/^#{1,6}\s/.test(trimmed)) {
      break;
    }
    if (/^[A-Za-z0-9_-]+:\s*$/.test(trimmed)) {
      break;
    }

    const match = trimmed.match(/^-+\s*`?([A-Za-z0-9_-]+)`?\s*$/);
    if (!match) {
      continue;
    }
    viewports.push(match[1]);
  }

  return viewports;
}

export function readContracts(rootPath) {
  const uiRuleDocPaths = resolveUiRuleDocPaths(rootPath);
  const uiRuleDocs = uiRuleDocPaths.map((path) => {
    const content = readFileSync(path, 'utf8');
    return {
      absolutePath: path,
      relativePath: relative(rootPath, path),
      content,
    };
  });
  const requiredViewports = [
    ...new Set(
      uiRuleDocs.flatMap((doc) => extractRequiredViewports(doc.content))
    ),
  ];
  const uiRulesContent = uiRuleDocs
    .map((doc) => {
      const trimmed = doc.content.trim();
      return trimmed ? `## ${doc.relativePath}\n${trimmed}` : '';
    })
    .filter(Boolean)
    .join('\n\n');

  return {
    uiRulesContent,
    requiredViewports:
      requiredViewports.length > 0
        ? requiredViewports
        : DEFAULT_REQUIRED_VIEWPORTS,
    paths: {
      uiRuleDocPaths,
    },
    sources: uiRuleDocs.map((doc) => doc.relativePath),
  };
}

function collectFilesRecursively(dirPath) {
  if (!existsSync(dirPath)) {
    return [];
  }
  const entries = readdirSync(dirPath);
  const filePaths = [];

  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      filePaths.push(...collectFilesRecursively(fullPath));
      continue;
    }
    filePaths.push(fullPath);
  }

  return filePaths;
}

export function inferTargetFromScenario(rootPath, scenarioId) {
  const candidateDirs = [
    resolve(rootPath, 'src/shared/components'),
    resolve(rootPath, 'src/stories'),
  ];
  const files = candidateDirs.flatMap((dirPath) =>
    collectFilesRecursively(dirPath)
  );
  const tokens = scenarioId
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3);

  const scored = files
    .map((filePath) => {
      const lowerPath = relative(rootPath, filePath).toLowerCase();
      const score = tokens.reduce(
        (acc, token) => (lowerPath.includes(token) ? acc + 1 : acc),
        0
      );
      return {
        path: relative(rootPath, filePath),
        score,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));

  if (scored.length === 0) {
    return null;
  }

  if (scored.length > 1 && scored[0].score === scored[1].score) {
    fail(
      `Ambiguous inferred targets for scenario ${scenarioId}: ${scored[0].path}, ${scored[1].path}`
    );
  }

  return scored[0].path;
}
