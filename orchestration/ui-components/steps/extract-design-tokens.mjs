import { writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { invokeAgentWithSchema } from '../lib/agent.mjs';

const TOOL_KEYS = ['designContext', 'variableDefs', 'metadata', 'screenshot'];
const CORE_TOKEN_KEYS = ['colors', 'typography', 'spacing'];
const TOKEN_KEYS = [
  'colors',
  'typography',
  'spacing',
  'radius',
  'size',
  'extras',
];
const VALID_STATUS = new Set(['ok', 'partial', 'unavailable', 'invalid']);

function normalizeStatus(value) {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();
  if (!VALID_STATUS.has(normalized)) {
    return 'invalid';
  }
  return normalized;
}

function normalizeText(value) {
  return String(value ?? '').trim();
}

function normalizeToolRecord(rawRecord, toolLabel) {
  const record =
    rawRecord && typeof rawRecord === 'object' && !Array.isArray(rawRecord)
      ? rawRecord
      : {};
  return {
    tool: toolLabel,
    status: normalizeStatus(record.status),
    output: normalizeText(record.output),
    error: normalizeText(record.error),
  };
}

function normalizeTokenItem(rawItem) {
  const item =
    rawItem && typeof rawItem === 'object' && !Array.isArray(rawItem)
      ? rawItem
      : {};
  return {
    name: normalizeText(item.name),
    value: normalizeText(item.value),
    source: normalizeText(item.source),
    nodeId: normalizeText(item.nodeId),
    note: normalizeText(item.note),
  };
}

function normalizeTokenList(rawList) {
  if (!Array.isArray(rawList)) {
    return [];
  }
  return rawList.map(normalizeTokenItem);
}

function normalizeDiagnostics(rawDiagnostics) {
  const diagnostics =
    rawDiagnostics &&
    typeof rawDiagnostics === 'object' &&
    !Array.isArray(rawDiagnostics)
      ? rawDiagnostics
      : {};
  const warnings = Array.isArray(diagnostics.warnings)
    ? diagnostics.warnings.map(normalizeText).filter(Boolean)
    : [];
  const errors = Array.isArray(diagnostics.errors)
    ? diagnostics.errors.map(normalizeText).filter(Boolean)
    : [];
  return { warnings, errors };
}

function hasUnavailableSignal(toolRecord) {
  if (toolRecord.status === 'unavailable') {
    return true;
  }
  const signalText = `${toolRecord.error}\n${toolRecord.output}`.toLowerCase();
  return /(rate limit|timed out|timeout|connection|unavailable|not configured|mcp|try again)/.test(
    signalText
  );
}

function calculateTokenStats(tokens) {
  const countsByCategory = Object.fromEntries(
    TOKEN_KEYS.map((category) => [category, tokens[category].length])
  );
  const totalTokens = TOKEN_KEYS.reduce(
    (acc, category) => acc + tokens[category].length,
    0
  );
  const coreCoverage = CORE_TOKEN_KEYS.filter(
    (category) => tokens[category].length > 0
  ).length;
  return {
    countsByCategory,
    totalTokens,
    coreCoverage,
  };
}

function deriveCaptureStatus(toolRecords, diagnostics, stats) {
  if (toolRecords.some(hasUnavailableSignal)) {
    return 'unavailable';
  }
  if (
    diagnostics.errors.length > 0 ||
    toolRecords.some((tool) => tool.status === 'invalid')
  ) {
    return 'invalid';
  }

  const hasAnyEvidence = toolRecords.some(
    (tool) => tool.output.length > 0 || tool.error.length > 0
  );
  if (!hasAnyEvidence) {
    return 'invalid';
  }

  if (stats.totalTokens === 0 || stats.coreCoverage < 2) {
    return 'partial';
  }
  if (toolRecords.some((tool) => tool.status === 'partial')) {
    return 'partial';
  }

  return 'ok';
}

function buildPrompt(context) {
  return [
    'You are collecting Figma MCP evidence for design token extraction.',
    `Analyze this Figma URL with MCP: ${context.scenario.figma.url}`,
    `Implementation scope node-id: ${context.figmaScope.selectedNodeId}`,
    '',
    'Required tool usage order:',
    '1) get_design_context',
    '2) get_variable_defs',
    '3) get_metadata',
    '4) get_screenshot',
    '',
    'Rules:',
    '- Keep outputs read-only and do not edit code or files.',
    '- Store each tool response in raw.<tool>.output as plain text.',
    '- If a tool fails/unavailable, set raw.<tool>.status and error without guessing.',
    '- For screenshot output, do not include binary image payloads.',
    '- Normalize tokens into: colors, typography, spacing, radius, size.',
    '- Put unmatched values in normalized.extras.',
    '- Every token item must include name/value/source/nodeId/note (empty string allowed).',
    '- Do not invent values that are not present in tool outputs.',
    'Return JSON only that matches the schema.',
  ].join('\n');
}

function createFallbackCapture(context, message) {
  return {
    schemaVersion: 'figma-mcp-capture.v1',
    collectedAt: new Date().toISOString(),
    figma: {
      url: context.scenario.figma.url,
      fileKey: context.figmaScope.fileKey,
      inputNodeId: context.figmaScope.nodeIdNormalized,
      selectedNodeId: context.figmaScope.selectedNodeId,
    },
    tools: {
      designContext: {
        tool: 'get_design_context',
        status: 'unavailable',
        output: '',
        error: message,
      },
      variableDefs: {
        tool: 'get_variable_defs',
        status: 'unavailable',
        output: '',
        error: message,
      },
      metadata: {
        tool: 'get_metadata',
        status: 'unavailable',
        output: '',
        error: message,
      },
      screenshot: {
        tool: 'get_screenshot',
        status: 'unavailable',
        output: '',
        error: message,
      },
    },
    normalized: {
      colors: [],
      typography: [],
      spacing: [],
      radius: [],
      size: [],
      extras: [],
    },
    stats: {
      countsByCategory: {
        colors: 0,
        typography: 0,
        spacing: 0,
        radius: 0,
        size: 0,
        extras: 0,
      },
      totalTokens: 0,
      coreCoverage: 0,
    },
    diagnostics: {
      warnings: [],
      errors: [message],
    },
    status: 'unavailable',
  };
}

export function stepExtractDesignTokens(context) {
  if (context.options.dryRun) {
    return {
      skipped: true,
      reason: '--dry-run option',
    };
  }

  if (context.scenario.gates.designTokensMode === 'off') {
    return {
      skipped: true,
      reason: '`gates.design_tokens_mode` is off',
    };
  }

  const schema = {
    type: 'object',
    properties: {
      raw: {
        type: 'object',
        properties: Object.fromEntries(
          TOOL_KEYS.map((key) => [
            key,
            {
              type: 'object',
              properties: {
                status: { type: 'string' },
                output: { type: 'string' },
                error: { type: 'string' },
              },
              required: ['status', 'output', 'error'],
              additionalProperties: false,
            },
          ])
        ),
        required: TOOL_KEYS,
        additionalProperties: false,
      },
      normalized: {
        type: 'object',
        properties: Object.fromEntries(
          TOKEN_KEYS.map((key) => [
            key,
            {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  value: { type: 'string' },
                  source: { type: 'string' },
                  nodeId: { type: 'string' },
                  note: { type: 'string' },
                },
                required: ['name', 'value', 'source', 'nodeId', 'note'],
                additionalProperties: false,
              },
            },
          ])
        ),
        required: TOKEN_KEYS,
        additionalProperties: false,
      },
      diagnostics: {
        type: 'object',
        properties: {
          warnings: {
            type: 'array',
            items: { type: 'string' },
          },
          errors: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        required: ['warnings', 'errors'],
        additionalProperties: false,
      },
    },
    required: ['raw', 'normalized', 'diagnostics'],
    additionalProperties: false,
  };

  let capture;
  let extractionMessage = null;

  try {
    const result = invokeAgentWithSchema(
      context,
      'design-tokens',
      buildPrompt(context),
      schema,
      context.scenario.figma.timeoutMs
    );

    const tools = {
      designContext: normalizeToolRecord(
        result.raw?.designContext,
        'get_design_context'
      ),
      variableDefs: normalizeToolRecord(
        result.raw?.variableDefs,
        'get_variable_defs'
      ),
      metadata: normalizeToolRecord(result.raw?.metadata, 'get_metadata'),
      screenshot: normalizeToolRecord(result.raw?.screenshot, 'get_screenshot'),
    };

    const normalized = {
      colors: normalizeTokenList(result.normalized?.colors),
      typography: normalizeTokenList(result.normalized?.typography),
      spacing: normalizeTokenList(result.normalized?.spacing),
      radius: normalizeTokenList(result.normalized?.radius),
      size: normalizeTokenList(result.normalized?.size),
      extras: normalizeTokenList(result.normalized?.extras),
    };

    const diagnostics = normalizeDiagnostics(result.diagnostics);
    const toolRecords = Object.values(tools);
    const stats = calculateTokenStats(normalized);
    const status = deriveCaptureStatus(toolRecords, diagnostics, stats);

    capture = {
      schemaVersion: 'figma-mcp-capture.v1',
      collectedAt: new Date().toISOString(),
      figma: {
        url: context.scenario.figma.url,
        fileKey: context.figmaScope.fileKey,
        inputNodeId: context.figmaScope.nodeIdNormalized,
        selectedNodeId: context.figmaScope.selectedNodeId,
      },
      tools,
      normalized,
      stats,
      diagnostics,
      status,
    };
  } catch (error) {
    extractionMessage =
      error instanceof Error
        ? error.message
        : `Unknown error: ${String(error)}`;
    capture = createFallbackCapture(context, extractionMessage);
    if (context.scenario.gates.designTokensMode === 'error') {
      throw error;
    }
    context.warnings.push(
      `Design token extraction warning: ${extractionMessage}`
    );
  }

  const artifactPath = resolve(
    context.artifactsDir,
    `${context.runId}-design-tokens.json`
  );
  writeFileSync(artifactPath, JSON.stringify(capture, null, 2), 'utf8');

  context.designTokens = capture;
  context.designTokensArtifactPath = artifactPath;

  return {
    status: capture.status,
    totalTokens: capture.stats.totalTokens,
    coreCoverage: capture.stats.coreCoverage,
    warnings: capture.diagnostics.warnings,
    errors: capture.diagnostics.errors,
    artifactPath: relative(context.rootPath, artifactPath),
    extractionMessage,
  };
}
