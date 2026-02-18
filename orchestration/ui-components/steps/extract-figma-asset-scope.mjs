import { writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { createCacheKey, findCachedArtifact } from '../lib/artifact-cache.mjs';
import {
  getLatestAgentMcpUsageRecord,
  invokeAgentWithSchema,
} from '../lib/agent.mjs';
import { enforceMcpGuardrails } from '../lib/mcp-guardrails.mjs';
import {
  analyzeGraphicSignals,
  buildCacheKey,
  createCapture,
  createNoCandidatesCapture,
  deriveProbeStatus,
  extractChildNodeIdsFromText,
  summarizeCalls,
} from './figma-asset-scope/helpers.mjs';

function buildEffectiveChildNodeIds(
  selectedNodeId,
  additionalNodeIds,
  inferredChildNodeIds,
  maxCandidates
) {
  const prioritizedCandidates = [...additionalNodeIds, ...inferredChildNodeIds];
  const childNodeIds = [];
  const uniqueNodeIds = new Set();
  for (const nodeId of prioritizedCandidates) {
    if (uniqueNodeIds.has(nodeId)) {
      continue;
    }
    uniqueNodeIds.add(nodeId);
    childNodeIds.push(nodeId);
    if (childNodeIds.length >= maxCandidates) {
      break;
    }
  }

  if (childNodeIds.length === 0 && selectedNodeId) {
    childNodeIds.push(selectedNodeId);
  }
  return childNodeIds;
}

function buildPrompt(context, selectedNodeId, childNodeIds) {
  return [
    'You are probing Figma child-node asset context using MCP.',
    `Figma URL: ${context.scenario.figma.url}`,
    `Selected node-id: ${selectedNodeId}`,
    '',
    'Task:',
    '- Call get_design_context for the selected node first.',
    '- Then call get_design_context for candidate child nodes listed below (in order).',
    '- Stop when candidates are exhausted.',
    '',
    'Candidate child node-ids:',
    ...(childNodeIds.length > 0
      ? childNodeIds.map((nodeId) => `- ${nodeId}`)
      : ['- (none)']),
    '',
    'Rules:',
    '- Use only get_design_context in this step.',
    '- Keep calls focused on listed node-ids.',
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
        enum: ['probed'],
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

function normalizeNodeId(value) {
  const normalized = String(value ?? '')
    .trim()
    .replace(/-/g, ':');
  return /^\d+:\d+$/.test(normalized) ? normalized : '';
}

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

function buildStepOutput(context, capture, artifactPath, source, candidates) {
  return {
    status: capture.status,
    candidates,
    probed: capture.totals?.totalCalls ?? 0,
    okCalls: capture.totals?.okCalls ?? 0,
    failedCalls: capture.totals?.failedCalls ?? 0,
    unavailableCalls: capture.totals?.unavailableCalls ?? 0,
    selectedGraphicSignal: Boolean(
      capture.selectedNode?.graphicSignals?.hasGraphicSignal
    ),
    graphicSignals: capture.totals?.graphicSignalCalls ?? 0,
    source,
    artifactPath: relative(context.rootPath, artifactPath),
  };
}

export function stepExtractFigmaAssetScope(context) {
  if (context.options.dryRun) {
    return {
      skipped: true,
      reason: '--dry-run option',
    };
  }

  if (!context.scenario.figma.assetProbeEnabled) {
    return {
      skipped: true,
      reason: '`figma.asset_probe_enabled` is false',
    };
  }

  const selectedNodeId = context.figmaScope?.selectedNodeId || '';
  const selectedDesignContext =
    context.figmaMcpDirectToolRecords?.get_design_context?.output || '';
  const selectedMetadata =
    context.figmaMcpDirectToolRecords?.get_metadata?.output || '';
  const designContextFingerprint = createCacheKey({
    selectedDesignContext,
    selectedMetadata,
  });
  const selectedGraphicSignals = analyzeGraphicSignals(selectedDesignContext);

  const maxCandidates = context.scenario.figma.assetProbeMaxCandidates;
  const timeoutMs = context.scenario.figma.assetProbeTimeoutMs;
  const additionalNodeIds = [];
  const inferredChildNodeIds = [
    ...new Set([
      ...extractChildNodeIdsFromText(selectedDesignContext),
      ...extractChildNodeIdsFromText(selectedMetadata),
    ]),
  ].filter((nodeId) => nodeId !== selectedNodeId);
  const childNodeIds = buildEffectiveChildNodeIds(
    selectedNodeId,
    additionalNodeIds,
    inferredChildNodeIds,
    maxCandidates
  );

  const endpoint = context.scenario.figma.mcpEndpoint;
  const cacheKey = buildCacheKey({
    context,
    selectedNodeId,
    endpoint,
    maxCandidates,
    timeoutMs,
    additionalNodeIds,
    designContextFingerprint,
  });
  const cached = findCachedArtifact({
    artifactsDir: context.artifactsDir,
    suffix: '-figma-asset-scope.json',
    cacheKey,
    accept: (data) =>
      data?.figma?.url === context.scenario.figma.url &&
      data?.figma?.selectedNodeId === selectedNodeId &&
      data?.config?.endpoint === endpoint &&
      data?.selectedNode?.nodeId === selectedNodeId &&
      data?.totals,
  });
  if (cached) {
    context.figmaAssetScope = cached.data;
    context.figmaAssetScopeArtifactPath = cached.artifactPath;
    return buildStepOutput(
      context,
      cached.data,
      cached.artifactPath,
      'cache',
      cached.data.selectedNode?.effectiveNodeIds?.length || 0
    );
  }

  let capture;
  if (childNodeIds.length === 0) {
    capture = createNoCandidatesCapture({
      cacheKey,
      context,
      selectedNodeId,
      selectedGraphicSignals,
      inferredChildNodeIds,
      additionalNodeIds,
      maxCandidates,
      timeoutMs,
      endpoint,
    });
  } else {
    invokeAgentWithSchema(
      context,
      'figma-asset-scope',
      buildPrompt(context, selectedNodeId, childNodeIds),
      buildSchema(),
      timeoutMs
    );
    enforceMcpGuardrails(context, 'figma-asset-scope', {
      maxCalls: Math.max(8, childNodeIds.length + 8),
    });

    const usageRecord = getLatestAgentMcpUsageRecord(
      context,
      'figma-asset-scope'
    );
    const calls = Array.isArray(usageRecord?.calls)
      ? usageRecord.calls
          .filter((call) => {
            const server = String(call.server || '')
              .trim()
              .toLowerCase();
            return (
              (!server || server === 'figma') &&
              call.tool === 'get_design_context'
            );
          })
          .map((call) => ({
            nodeId: normalizeNodeId(call.nodeId),
            tool: 'get_design_context',
            status: normalizeCallStatus(call.status),
            error: String(call.error || ''),
            durationMs: 0,
            graphicSignals: analyzeGraphicSignals(call.output),
          }))
          .filter((call) => Boolean(call.nodeId))
      : [];

    const probedNodeIds = [...new Set(calls.map((call) => call.nodeId))];
    const effectiveNodeIds = probedNodeIds.filter(
      (nodeId) => nodeId !== selectedNodeId
    );
    const totals = summarizeCalls(calls);
    const status = deriveProbeStatus(true, totals, probedNodeIds.length);

    capture = createCapture({
      cacheKey,
      context,
      selectedNodeId,
      selectedGraphicSignals,
      inferredChildNodeIds,
      additionalNodeIds,
      childNodeIds: effectiveNodeIds,
      calls,
      totals,
      status,
      maxCandidates,
      timeoutMs,
      endpoint,
    });
  }

  const artifactPath = resolve(
    context.artifactsDir,
    `${context.runId}-figma-asset-scope.json`
  );
  writeFileSync(artifactPath, JSON.stringify(capture, null, 2), 'utf8');

  context.figmaAssetScope = capture;
  context.figmaAssetScopeArtifactPath = artifactPath;
  return buildStepOutput(
    context,
    capture,
    artifactPath,
    'fresh',
    childNodeIds.length
  );
}
