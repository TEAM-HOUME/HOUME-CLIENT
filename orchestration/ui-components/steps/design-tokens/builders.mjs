import { relative } from 'node:path';

import { createCacheKey } from '../../lib/artifact-cache.mjs';
import { FIGMA_REQUIRED_TOOLS } from '../../lib/mcp-guardrails.mjs';
import { buildRunContextLines } from '../../lib/prompt-run-context.mjs';
import { CACHE_SCHEMA_VERSION, TOKEN_KEYS, TOOL_KEYS } from './constants.mjs';
import {
  calculateTokenStats,
  deriveCaptureStatus,
  directToolRecordToCaptureRecord,
  normalizeDiagnostics,
  normalizeTokenList,
  normalizeToolRecord,
} from './normalize.mjs';

function buildDocsHash(context) {
  return createCacheKey({
    sources: context.contracts?.sources || [],
    uiRulesContent: context.contracts?.uiRulesContent || '',
  });
}

function buildDirectToolsFingerprint(context) {
  const directTools = context.figmaMcpDirectToolRecords || {};
  return createCacheKey({
    get_design_context: {
      status: directTools.get_design_context?.status || '',
      output: directTools.get_design_context?.output || '',
      error: directTools.get_design_context?.error || '',
    },
    get_variable_defs: {
      status: directTools.get_variable_defs?.status || '',
      output: directTools.get_variable_defs?.output || '',
      error: directTools.get_variable_defs?.error || '',
    },
    get_metadata: {
      status: directTools.get_metadata?.status || '',
      output: directTools.get_metadata?.output || '',
      error: directTools.get_metadata?.error || '',
    },
    get_screenshot: {
      status: directTools.get_screenshot?.status || '',
      error: directTools.get_screenshot?.error || '',
    },
  });
}

function sanitizeScreenshotOutput(output) {
  const text = String(output || '');
  if (!text) {
    return '';
  }

  return `[screenshot output redacted: base64 payload omitted, length=${text.length}]`;
}

function sanitizeScreenshotRecord(record) {
  if (!record || typeof record !== 'object') {
    return record;
  }
  return {
    ...record,
    output: sanitizeScreenshotOutput(record.output),
  };
}

export function buildCacheKey(context) {
  return createCacheKey({
    schema: CACHE_SCHEMA_VERSION,
    figmaUrl: context.scenario.figma.url,
    selectedNodeId: context.figmaScope.selectedNodeId,
    endpoint: context.scenario.figma.mcpEndpoint,
    gates: {
      designTokensMode: context.scenario.gates.designTokensMode,
      assetCoverageMode: context.scenario.gates.assetCoverageMode,
      scopeGateMode: context.scenario.gates.scopeGateMode,
      intentMode: context.scenario.gates.intentMode,
      intentMinConfidence: context.scenario.gates.intentMinConfidence,
    },
    docsHash: buildDocsHash(context),
    directToolsFingerprint: buildDirectToolsFingerprint(context),
  });
}

export function buildPrompt(context) {
  const designContextPath = context.designContextArtifactPath
    ? relative(context.rootPath, context.designContextArtifactPath)
    : '(missing)';
  const runContextLines = buildRunContextLines(context, {
    stageName: 'extract-design-tokens',
    stagePurpose: 'Normalize token data from required Figma MCP tool outputs.',
    successCriteria: [
      'Call all required MCP tools and preserve raw outputs.',
      'Return normalized token categories with diagnostics.',
    ],
  });
  return [
    'You are normalizing design tokens for a Figma implementation scope.',
    ...runContextLines,
    '',
    `Figma URL: ${context.scenario.figma.url}`,
    `Implementation scope node-id: ${context.figmaScope.selectedNodeId}`,
    `Design context artifact: ${designContextPath}`,
    '',
    'Rules:',
    '- In this step, call required Figma MCP tools directly for the selected node.',
    `- Required tool coverage (all must be called at least once): ${FIGMA_REQUIRED_TOOLS.join(', ')}`,
    '- Keep outputs read-only and do not edit code or files.',
    '- Preserve raw.<tool> status/output/error from MCP results.',
    '- Normalize tokens into: colors, typography, spacing, radius, size.',
    '- Put unmatched values in normalized.extras.',
    '- Every token item must include name/value/source/nodeId/note (empty string allowed).',
    '- Do not invent values that are not present in tool outputs.',
    '- diagnostics.warnings and diagnostics.errors must be written in Korean.',
    'Return JSON only that matches the schema.',
  ].join('\n');
}

export function buildSchema() {
  return {
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
}

function buildToolRecords(context, raw = {}) {
  const directTools = context.figmaMcpDirectToolRecords || null;
  return {
    designContext:
      directToolRecordToCaptureRecord(
        directTools?.get_design_context,
        'get_design_context'
      ) || normalizeToolRecord(raw.designContext, 'get_design_context'),
    variableDefs:
      directToolRecordToCaptureRecord(
        directTools?.get_variable_defs,
        'get_variable_defs'
      ) || normalizeToolRecord(raw.variableDefs, 'get_variable_defs'),
    metadata:
      directToolRecordToCaptureRecord(
        directTools?.get_metadata,
        'get_metadata'
      ) || normalizeToolRecord(raw.metadata, 'get_metadata'),
    screenshot:
      sanitizeScreenshotRecord(
        directToolRecordToCaptureRecord(
          directTools?.get_screenshot,
          'get_screenshot'
        )
      ) ||
      sanitizeScreenshotRecord(
        normalizeToolRecord(raw.screenshot, 'get_screenshot')
      ),
  };
}

function buildNormalizedTokens(rawNormalized = {}) {
  return {
    colors: normalizeTokenList(rawNormalized.colors),
    typography: normalizeTokenList(rawNormalized.typography),
    spacing: normalizeTokenList(rawNormalized.spacing),
    radius: normalizeTokenList(rawNormalized.radius),
    size: normalizeTokenList(rawNormalized.size),
    extras: normalizeTokenList(rawNormalized.extras),
  };
}

export function buildCaptureFromAgentResult(context, result, cacheKey) {
  const tools = buildToolRecords(context, result.raw);
  const normalized = buildNormalizedTokens(result.normalized);
  const diagnostics = normalizeDiagnostics(result.diagnostics);
  const toolRecords = Object.values(tools);
  const stats = calculateTokenStats(normalized);
  const status = deriveCaptureStatus(toolRecords, diagnostics, stats);

  return {
    schemaVersion: 'figma-mcp-capture.v1',
    cache: {
      version: CACHE_SCHEMA_VERSION,
      key: cacheKey,
      createdAt: new Date().toISOString(),
    },
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
}

export function createFallbackCapture(context, message, cacheKey) {
  return {
    schemaVersion: 'figma-mcp-capture.v1',
    cache: {
      version: CACHE_SCHEMA_VERSION,
      key: cacheKey,
      createdAt: new Date().toISOString(),
    },
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
