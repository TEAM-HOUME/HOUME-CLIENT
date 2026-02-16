import { writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { invokeAgentWithSchema } from '../lib/agent.mjs';

const ALLOWED_STATUS = new Set(['ok', 'no_mapping', 'unavailable', 'error']);

function normalizeStatus(value) {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();
  if (!ALLOWED_STATUS.has(normalized)) {
    return 'error';
  }
  return normalized;
}

function normalizePath(value) {
  return String(value ?? '')
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\.\//, '');
}

function normalizeMappings(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => ({
    figmaNodeId: String(item.figmaNodeId ?? '').trim(),
    componentName: String(item.componentName ?? '').trim(),
    mappedFilePath: normalizePath(item.mappedFilePath),
    note: String(item.note ?? '').trim(),
  }));
}

function buildPrompt(context) {
  return [
    'You are collecting Code Connect mapping as read-only evidence.',
    `Analyze Figma URL with MCP: ${context.scenario.figma.url}`,
    `Implementation scope node-id: ${context.figmaScope.selectedNodeId}`,
    `Planned target path: ${context.componentPlan.targetPath}`,
    'Use Figma MCP code-connect capability (for example get_code_connect_map) if available.',
    'If Code Connect is unavailable or no mapping exists, do not guess.',
    'Return JSON only that matches the schema.',
  ].join('\n');
}

export function stepExtractCodeConnectMap(context) {
  if (context.options.dryRun) {
    return {
      skipped: true,
      reason: '--dry-run option',
    };
  }

  if (context.scenario.gates.codeConnectMode === 'off') {
    return {
      skipped: true,
      reason: '`gates.code_connect_mode` is off',
    };
  }

  const schema = {
    type: 'object',
    properties: {
      status: { type: 'string' },
      mappings: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            figmaNodeId: { type: 'string' },
            componentName: { type: 'string' },
            mappedFilePath: { type: 'string' },
            note: { type: 'string' },
          },
          required: ['figmaNodeId', 'componentName', 'mappedFilePath', 'note'],
          additionalProperties: false,
        },
      },
      notes: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: ['status', 'mappings', 'notes'],
    additionalProperties: false,
  };

  let normalized;

  try {
    const result = invokeAgentWithSchema(
      context,
      'code-connect-map',
      buildPrompt(context),
      schema,
      context.scenario.figma.timeoutMs
    );

    normalized = {
      status: normalizeStatus(result.status),
      mappings: normalizeMappings(result.mappings),
      notes: Array.isArray(result.notes) ? result.notes.map(String) : [],
      source: 'agent',
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : `Unknown error: ${String(error)}`;
    normalized = {
      status: 'error',
      mappings: [],
      notes: [message],
      source: 'fallback',
    };

    if (context.scenario.gates.codeConnectMode === 'error') {
      throw error;
    }
    context.warnings.push(`Code Connect extraction warning: ${message}`);
  }

  const artifactPath = resolve(
    context.artifactsDir,
    `${context.runId}-code-connect.json`
  );
  writeFileSync(artifactPath, JSON.stringify(normalized, null, 2), 'utf8');

  context.codeConnectMap = normalized;
  context.codeConnectArtifactPath = artifactPath;

  return {
    status: normalized.status,
    mappings: normalized.mappings.length,
    notes: normalized.notes,
    artifactPath: relative(context.rootPath, artifactPath),
  };
}
