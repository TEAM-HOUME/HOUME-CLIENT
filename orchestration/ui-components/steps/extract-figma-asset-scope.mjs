import { mkdirSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { createCacheKey, findCachedArtifact } from '../lib/artifact-cache.mjs';
import {
  callFigmaMcpTool,
  classifyJsonRpcCall,
  extractToolTextOutput,
  initializeFigmaMcpSession,
} from '../lib/figma-mcp-direct.mjs';
import {
  analyzeGraphicSignals,
  buildCacheKey,
  createCapture,
  createNoCandidatesCapture,
  createUnavailableCalls,
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

  const baseDir = resolve(
    context.artifactsDir,
    context.runId,
    'figma-asset-scope'
  );
  mkdirSync(baseDir, { recursive: true });

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
    const session = initializeFigmaMcpSession({
      endpoint,
      timeoutMs,
    });

    let calls = [];
    if (!session.ok) {
      const initializeError =
        session.initializeState?.error ||
        'MCP initialize failed during asset probe';
      calls = createUnavailableCalls(childNodeIds, initializeError);
    } else {
      calls = childNodeIds.map((nodeId, index) => {
        const requestId = 500 + index;
        const callRecord = callFigmaMcpTool({
          endpoint,
          sessionId: session.sessionId,
          timeoutMs,
          requestId,
          toolName: 'get_design_context',
          toolArguments: {
            nodeId,
            clientLanguages: 'typescript',
            clientFrameworks: 'react',
            dirForAssetWrites: baseDir,
          },
        });
        const state = classifyJsonRpcCall(callRecord);
        const output = extractToolTextOutput(callRecord);
        return {
          nodeId,
          tool: 'get_design_context',
          status: state.status,
          error: state.error,
          durationMs: callRecord.response.durationMs,
          graphicSignals: analyzeGraphicSignals(output),
        };
      });
    }

    const totals = summarizeCalls(calls);
    const status = deriveProbeStatus(session.ok, totals, childNodeIds.length);
    capture = createCapture({
      cacheKey,
      context,
      selectedNodeId,
      selectedGraphicSignals,
      inferredChildNodeIds,
      additionalNodeIds,
      childNodeIds,
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
