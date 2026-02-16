import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

import { DEFAULT_FIGMA_TIMEOUT_MS } from './constants.mjs';
import { fail } from './errors.mjs';

function stripQuotes(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseTopLevelList(content, key) {
  const lines = content.split(/\r?\n/);
  const sectionPattern = new RegExp(`^${key}:\\s*$`);
  const values = [];
  let sectionStart = -1;

  for (let i = 0; i < lines.length; i += 1) {
    if (sectionPattern.test(lines[i])) {
      sectionStart = i;
      break;
    }
  }

  if (sectionStart === -1) {
    return values;
  }

  for (let i = sectionStart + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) {
      continue;
    }
    if (/^\S/.test(line)) {
      break;
    }

    const itemMatch = line.match(/^\s*-\s*(.+)\s*$/);
    if (!itemMatch) {
      break;
    }
    values.push(stripQuotes(itemMatch[1]));
  }

  return values;
}

function parseSection(content, sectionName) {
  const lines = content.split(/\r?\n/);
  const sectionStartPattern = new RegExp(`^${sectionName}:\\s*$`);
  let sectionStart = -1;

  for (let i = 0; i < lines.length; i += 1) {
    if (sectionStartPattern.test(lines[i])) {
      sectionStart = i;
      break;
    }
  }

  if (sectionStart === -1) {
    return [];
  }

  const sectionLines = [];
  for (let i = sectionStart + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^\S/.test(line)) {
      break;
    }
    sectionLines.push(line);
  }

  return sectionLines;
}

function parseSectionScalar(sectionLines, key, defaultValue = null) {
  const keyPattern = new RegExp(`^\\s{2}${key}:\\s*(.+)\\s*$`);
  for (const line of sectionLines) {
    const match = line.match(keyPattern);
    if (match) {
      return stripQuotes(match[1]);
    }
  }
  return defaultValue;
}

function parseSectionBoolean(sectionLines, key, defaultValue = false) {
  const value = parseSectionScalar(sectionLines, key, null);
  if (value === null) {
    return defaultValue;
  }
  return value === 'true';
}

function parseSectionNumber(sectionLines, key, defaultValue) {
  const value = parseSectionScalar(sectionLines, key, null);
  if (value === null) {
    return defaultValue;
  }
  const numeric = Number(value);
  return Number.isNaN(numeric) ? defaultValue : numeric;
}

function parseEnumValue(rawValue, allowedValues, defaultValue, fieldName) {
  if (rawValue === null || rawValue === undefined) {
    return defaultValue;
  }

  const normalized = String(rawValue).trim().toLowerCase();
  if (!allowedValues.includes(normalized)) {
    fail(
      `Invalid ${fieldName}: ${rawValue}. Allowed values: ${allowedValues.join(', ')}`
    );
  }
  return normalized;
}

function parseSectionList(sectionLines, key) {
  const values = [];
  const keyPattern = new RegExp(`^\\s{2}${key}:\\s*$`);
  let inList = false;

  for (const line of sectionLines) {
    if (!inList) {
      if (keyPattern.test(line)) {
        inList = true;
      }
      continue;
    }

    if (!line.trim() || line.trim().startsWith('#')) {
      continue;
    }

    if (/^\s{2}[A-Za-z0-9_-]+:\s*/.test(line)) {
      break;
    }

    const itemMatch = line.match(/^\s{4}-\s*(.+)\s*$/);
    if (!itemMatch) {
      break;
    }
    values.push(stripQuotes(itemMatch[1]));
  }

  return values;
}

export function parseArgs(argv) {
  const scenarioIndex = argv.indexOf('--scenario');
  let scenarioArg = null;

  if (scenarioIndex !== -1) {
    const scenarioParts = [];
    for (let i = scenarioIndex + 1; i < argv.length; i += 1) {
      const token = argv[i];
      if (!token) {
        continue;
      }
      if (token.startsWith('--')) {
        break;
      }
      scenarioParts.push(token);
    }

    if (scenarioParts.length > 0) {
      scenarioArg = scenarioParts.join('');
    }
  }

  return {
    scenarioArg,
    dryRun: argv.includes('--dry-run'),
    approveVisual: argv.includes('--approve-visual'),
    skipMcpCheck: argv.includes('--skip-mcp-check'),
    openStorybook: argv.includes('--open-storybook'),
  };
}

export function readScenario(pathArg) {
  const scenarioPath = resolve(process.cwd(), pathArg);
  if (!existsSync(scenarioPath)) {
    fail(`Scenario not found: ${scenarioPath}`);
  }
  if (statSync(scenarioPath).isDirectory()) {
    fail(
      `Scenario path is a directory: ${scenarioPath}. Use a .yml file path (e.g. orchestration/ui-components/scenarios/jjym-toast.yml).`
    );
  }

  const content = readFileSync(scenarioPath, 'utf8');
  const idMatch = content.match(/^id:\s*([^\n#]+)\s*$/m);
  const agentSection = parseSection(content, 'agent');
  const figmaSection = parseSection(content, 'figma');
  const gatesSection = parseSection(content, 'gates');
  const engine = parseSectionScalar(agentSection, 'engine', null);
  const figmaUrl = parseSectionScalar(figmaSection, 'url', null);
  const targets = parseTopLevelList(content, 'targets');
  const verification = parseTopLevelList(content, 'verification');

  if (!idMatch) {
    fail('Scenario must include top-level `id`.');
  }
  if (!engine) {
    fail('Scenario must include `agent.engine`.');
  }
  if (!figmaUrl) {
    fail('Scenario must include `figma.url`.');
  }
  if (targets.length === 0) {
    fail('Scenario must include at least one `targets` entry.');
  }

  return {
    path: scenarioPath,
    id: stripQuotes(idMatch[1]),
    engine,
    agent: {
      command: parseSectionScalar(agentSection, 'command', null),
      args: parseSectionList(agentSection, 'args'),
    },
    figma: {
      url: figmaUrl,
      autoParent: parseSectionBoolean(figmaSection, 'auto_parent', false),
      parentHopsMax: parseSectionNumber(figmaSection, 'parent_hops_max', 3),
      timeoutMs: parseSectionNumber(
        figmaSection,
        'timeout_ms',
        DEFAULT_FIGMA_TIMEOUT_MS
      ),
      scopeNodeId: parseSectionScalar(figmaSection, 'scope_node_id', null),
    },
    gates: {
      requireVisualApproval: parseSectionBoolean(
        gatesSection,
        'require_visual_approval',
        true
      ),
      codeConnectMode: parseEnumValue(
        parseSectionScalar(gatesSection, 'code_connect_mode', null),
        ['off', 'warn', 'error'],
        'warn',
        'gates.code_connect_mode'
      ),
      allowedChangedPaths: parseSectionList(
        gatesSection,
        'allowed_changed_paths'
      ),
    },
    targets,
    verification,
  };
}
