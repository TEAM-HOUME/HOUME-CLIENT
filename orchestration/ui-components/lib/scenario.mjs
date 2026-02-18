import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

import { DEFAULT_FIGMA_TIMEOUT_MS } from './constants.mjs';
import { DEFAULT_FIGMA_MCP_ENDPOINT } from './constants.mjs';
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

function parseTopLevelScalar(content, key) {
  const scalarMatch = content.match(
    new RegExp(`^${key}:\\s*([^\\n#]+)\\s*$`, 'm')
  );
  if (!scalarMatch) {
    return null;
  }
  return stripQuotes(scalarMatch[1]);
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

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function createScenarioId(figmaUrl, brief) {
  let nodePart = 'node';
  try {
    const url = new URL(figmaUrl);
    const nodeId = decodeURIComponent(
      url.searchParams.get('node-id') || 'node'
    );
    nodePart = nodeId.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (!nodePart) {
      nodePart = 'node';
    }
  } catch {
    nodePart = 'node';
  }

  const keywordPart = String(brief || '')
    .toLowerCase()
    .split(/[^a-z0-9가-힣]+/)
    .filter((token) => token.length >= 2)
    .slice(0, 3)
    .join('-');
  const hash = createHash('sha1')
    .update(`${figmaUrl}|${brief}`)
    .digest('hex')
    .slice(0, 6);

  const raw = `ui-${keywordPart || 'component'}-${nodePart}-${hash}`;
  return raw
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
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
    skipVerify: argv.includes('--skip-verify'),
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
  const brief = parseTopLevelScalar(content, 'brief');
  const intentSection = parseSection(content, 'intent');
  const behaviorSection = parseSection(content, 'behavior');
  const figmaSection = parseSection(content, 'figma');
  const gatesSection = parseSection(content, 'gates');
  const figmaUrl = parseSectionScalar(figmaSection, 'url', null);

  if (!figmaUrl) {
    fail('Scenario must include `figma.url`.');
  }
  if (!brief) {
    fail('Scenario must include top-level `brief`.');
  }
  const scenarioId = createScenarioId(figmaUrl, brief);
  const figmaTimeoutMs = parseSectionNumber(
    figmaSection,
    'timeout_ms',
    DEFAULT_FIGMA_TIMEOUT_MS
  );
  const assetProbeMaxCandidates = clamp(
    Math.trunc(
      parseSectionNumber(figmaSection, 'asset_probe_max_candidates', 8)
    ),
    1,
    24
  );
  const intentMinConfidence = clamp(
    parseSectionNumber(gatesSection, 'intent_min_confidence', 0.75),
    0,
    1
  );

  return {
    path: scenarioPath,
    id: scenarioId,
    engine: 'codex',
    intent: {
      brief: stripQuotes(brief),
      pageHint: parseSectionScalar(intentSection, 'page', ''),
      componentKindHint: parseSectionScalar(
        intentSection,
        'component_kind',
        ''
      ),
      roleHint: parseSectionScalar(intentSection, 'role', ''),
      stateHint: parseSectionScalar(intentSection, 'state', ''),
      notes: parseSectionScalar(intentSection, 'notes', ''),
    },
    figma: {
      url: figmaUrl,
      autoParent: parseSectionBoolean(figmaSection, 'auto_parent', true),
      parentHopsMax: parseSectionNumber(figmaSection, 'parent_hops_max', 3),
      timeoutMs: figmaTimeoutMs,
      mcpEndpoint: DEFAULT_FIGMA_MCP_ENDPOINT,
      scopeNodeId: parseSectionScalar(figmaSection, 'scope_node_id', null),
      assetProbeEnabled: parseSectionBoolean(
        figmaSection,
        'asset_probe_enabled',
        true
      ),
      assetProbeMaxCandidates,
      assetProbeTimeoutMs: parseSectionNumber(
        figmaSection,
        'asset_probe_timeout_ms',
        figmaTimeoutMs
      ),
    },
    behavior: {
      confirmed: parseSectionBoolean(behaviorSection, 'confirmed', false),
      spec: parseSectionScalar(behaviorSection, 'spec', ''),
    },
    gates: {
      requireVisualApproval: true,
      designTokensMode: 'error',
      figmaMcpLogsMode: 'error',
      assetCoverageMode: parseEnumValue(
        parseSectionScalar(gatesSection, 'asset_coverage_mode', null),
        ['off', 'warn', 'error'],
        'error',
        'gates.asset_coverage_mode'
      ),
      scopeGateMode: parseEnumValue(
        parseSectionScalar(gatesSection, 'scope_gate_mode', null),
        ['warn', 'error'],
        'warn',
        'gates.scope_gate_mode'
      ),
      intentMode: parseEnumValue(
        parseSectionScalar(gatesSection, 'intent_mode', null),
        ['warn', 'error'],
        'error',
        'gates.intent_mode'
      ),
      intentMinConfidence,
      allowedChangedPaths: parseSectionList(
        gatesSection,
        'allowed_changed_paths'
      ),
    },
    verification: ['storybook'],
  };
}
