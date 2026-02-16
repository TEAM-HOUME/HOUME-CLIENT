import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { fail } from './errors.mjs';

function parseComponentMap(content) {
  const components = {};
  const blockRegex = /^\s{2}([A-Za-z0-9_-]+):\s*\n((?:\s{4}[^\n]*\n?)*)/gm;
  let match;

  while ((match = blockRegex.exec(content)) !== null) {
    const componentKey = match[1];
    const block = match[2];
    const actionMatch = block.match(/^\s{4}action:\s*([^\n#]+)\s*$/m);
    const pathMatch = block.match(/^\s{4}path:\s*([^\n#]+)\s*$/m);
    const storyMatch = block.match(/^\s{4}story:\s*([^\n#]+)\s*$/m);

    components[componentKey] = {
      action: actionMatch
        ? actionMatch[1].trim().replace(/^['"]|['"]$/g, '')
        : null,
      path: pathMatch ? pathMatch[1].trim().replace(/^['"]|['"]$/g, '') : null,
      story: storyMatch
        ? storyMatch[1].trim().replace(/^['"]|['"]$/g, '')
        : null,
    };
  }

  return components;
}

export function readContracts(rootPath) {
  const componentMapPath = resolve(
    rootPath,
    'orchestration/ui-components/contracts/component-map.yml'
  );
  const uiRulesPath = resolve(
    rootPath,
    'orchestration/ui-components/contracts/ui-rules.yml'
  );

  if (!existsSync(componentMapPath)) {
    fail(`Component map not found: ${componentMapPath}`);
  }
  if (!existsSync(uiRulesPath)) {
    fail(`UI rules not found: ${uiRulesPath}`);
  }

  const componentMapContent = readFileSync(componentMapPath, 'utf8');
  const uiRulesContent = readFileSync(uiRulesPath, 'utf8');

  const requiredViewports = [
    ...uiRulesContent.matchAll(/^\s*-\s*([A-Za-z0-9_-]+)\s*$/gm),
  ].map((match) => match[1]);

  return {
    componentMap: parseComponentMap(componentMapContent),
    uiRulesContent,
    requiredViewports,
    paths: {
      componentMapPath,
      uiRulesPath,
    },
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
