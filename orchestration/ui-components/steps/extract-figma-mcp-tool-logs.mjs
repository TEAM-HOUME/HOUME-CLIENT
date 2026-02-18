import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { findCachedArtifact } from '../lib/artifact-cache.mjs';
import {
  getLatestAgentMcpUsageRecord,
  invokeAgentWithSchema,
} from '../lib/agent.mjs';
import {
  enforceMcpGuardrails,
  FIGMA_REQUIRED_TOOLS,
} from '../lib/mcp-guardrails.mjs';
import { CACHE_SCHEMA_VERSION } from './figma-mcp-tool-logs/constants.mjs';
import {
  buildCacheKey,
  buildStepOutput,
  summarizeToolCalls,
} from './figma-mcp-tool-logs/helpers.mjs';

function normalizeCallStatus(value) {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();
  if (
    normalized === 'ok' ||
    normalized === 'failed' ||
    normalized === 'unavailable'
  ) {
    return normalized;
  }
  if (normalized === 'partial' || normalized === 'no_mapping') {
    return 'ok';
  }
  return 'failed';
}

function buildPrompt(context, nodeId) {
  return [
    'You are collecting Figma MCP evidence for one implementation node.',
    `Figma URL: ${context.scenario.figma.url}`,
    `Node ID: ${nodeId}`,
    '',
    'Required tool calls (minimum once each):',
    ...FIGMA_REQUIRED_TOOLS.map((tool) => `- ${tool}`),
    '',
    'Rules:',
    '- Use Figma MCP tools directly in this step.',
    '- Keep the tool-call count minimal and avoid unrelated nodes.',
    '- Do not edit files.',
    '- Return JSON only matching schema.',
    '- notes must be written in Korean.',
  ].join('\n');
}

function buildSchema() {
  return {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['captured'],
      },
      notes: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: ['status', 'notes'],
    additionalProperties: false,
  };
}

function selectLatestCallByTool(calls, toolName) {
  for (let i = calls.length - 1; i >= 0; i -= 1) {
    if (calls[i]?.tool === toolName) {
      return calls[i];
    }
  }
  return null;
}

function toLogCall(call) {
  return {
    tool: call.tool,
    status: normalizeCallStatus(call.status),
    error: String(call.error || ''),
    durationMs: 0,
    httpStatus: null,
    nodeId: String(call.nodeId || ''),
  };
}

function toToolRecord(toolName, call) {
  if (!call) {
    return {
      tool: toolName,
      status: 'unavailable',
      output: '',
      error: 'Required tool call missing in agent trace',
    };
  }

  return {
    tool: toolName,
    status: normalizeCallStatus(call.status),
    output: String(call.output || ''),
    error: String(call.error || ''),
  };
}

function writeSummary(context, summary) {
  const summaryPath = resolve(
    context.artifactsDir,
    `${context.runId}-figma-mcp-tool-logs.json`
  );
  writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
  return summaryPath;
}

function resolveCachedSummary(context, cacheKey, nodeId, endpoint) {
  return findCachedArtifact({
    artifactsDir: context.artifactsDir,
    suffix: '-figma-mcp-tool-logs.json',
    cacheKey,
    accept: (data) =>
      data?.selectedNodeId === nodeId &&
      data?.endpoint === endpoint &&
      data?.directToolRecords &&
      typeof data.directToolRecords === 'object' &&
      Array.isArray(data.calls),
  });
}

export function stepExtractFigmaMcpToolLogs(context) {
  if (context.options.dryRun) {
    return {
      skipped: true,
      reason: '--dry-run option',
    };
  }

  if (context.scenario.gates.figmaMcpLogsMode === 'off') {
    return {
      skipped: true,
      reason: '`gates.figma_mcp_logs_mode` is off',
    };
  }

  const endpoint = context.scenario.figma.mcpEndpoint;
  const timeoutMs = context.scenario.figma.timeoutMs;
  const nodeId = context.figmaScope.selectedNodeId;
  const cacheKey = buildCacheKey(context, nodeId);
  const cached = resolveCachedSummary(context, cacheKey, nodeId, endpoint);
  if (cached) {
    context.figmaMcpToolLogs = cached.data;
    context.figmaMcpToolLogsArtifactPath = cached.artifactPath;
    context.figmaMcpDirectToolRecords = cached.data.directToolRecords;
    return buildStepOutput(
      context,
      nodeId,
      cached.data.calls,
      cached.data.totals,
      'cache',
      cached.artifactPath
    );
  }

  invokeAgentWithSchema(
    context,
    'figma-mcp-tool-logs',
    buildPrompt(context, nodeId),
    buildSchema(),
    timeoutMs
  );
  enforceMcpGuardrails(context, 'figma-mcp-tool-logs');

  const usageRecord = getLatestAgentMcpUsageRecord(
    context,
    'figma-mcp-tool-logs'
  );
  const figmaCalls = Array.isArray(usageRecord?.calls)
    ? usageRecord.calls.filter((call) => {
        const server = String(call.server || '')
          .trim()
          .toLowerCase();
        return !server || server === 'figma';
      })
    : [];

  const calls = figmaCalls.map(toLogCall);
  const directToolRecords = Object.fromEntries(
    FIGMA_REQUIRED_TOOLS.map((toolName) => [
      toolName,
      toToolRecord(toolName, selectLatestCallByTool(figmaCalls, toolName)),
    ])
  );
  const totals = summarizeToolCalls(calls);

  const summary = {
    cache: {
      version: CACHE_SCHEMA_VERSION,
      key: cacheKey,
      createdAt: new Date().toISOString(),
    },
    endpoint,
    sessionId: null,
    mode: context.scenario.gates.figmaMcpLogsMode,
    selectedNodeId: nodeId,
    requiredTools: FIGMA_REQUIRED_TOOLS,
    availableTools: FIGMA_REQUIRED_TOOLS.filter(
      (tool) => selectLatestCallByTool(figmaCalls, tool) !== null
    ),
    toolsList: {
      status: 'ok',
      error: '',
    },
    calls,
    callArtifacts: [],
    totals,
    directToolRecords,
  };

  const summaryPath = writeSummary(context, summary);
  context.figmaMcpToolLogs = summary;
  context.figmaMcpToolLogsArtifactPath = summaryPath;
  context.figmaMcpDirectToolRecords = directToolRecords;

  return buildStepOutput(context, nodeId, calls, totals, 'fresh', summaryPath);
}
