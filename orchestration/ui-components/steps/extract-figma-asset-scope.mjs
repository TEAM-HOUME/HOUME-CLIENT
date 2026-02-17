import { mkdirSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { createCacheKey, findCachedArtifact } from '../lib/artifact-cache.mjs';
import {
  callFigmaMcpTool,
  classifyJsonRpcCall,
  extractToolTextOutput,
  initializeFigmaMcpSession,
} from '../lib/figma-mcp-direct.mjs';
import { resolveFigmaMcpAuth } from '../lib/figma-mcp-auth.mjs';

const CACHE_SCHEMA_VERSION = 'figma-asset-scope-cache.v1';

function normalizeNodeId(rawValue) {
  const normalized = String(rawValue ?? '')
    .trim()
    .replace(/-/g, ':');
  if (!normalized) {
    return null;
  }

  const tail = normalized.includes(';')
    ? normalized.split(';').at(-1) || ''
    : normalized;
  const withoutInstancePrefix = tail.replace(/^i(?=\d+:\d+$)/i, '');
  if (!/^\d+:\d+$/.test(withoutInstancePrefix)) {
    return null;
  }
  return withoutInstancePrefix;
}

function collectNodeIdsByPattern(sourceText, unique, pattern, groupIndex = 1) {
  const matches = String(sourceText ?? '').matchAll(pattern);
  for (const match of matches) {
    const candidate = match[groupIndex];
    const normalized = normalizeNodeId(candidate);
    if (normalized) {
      unique.add(normalized);
    }
  }
}

function extractChildNodeIdsFromText(text) {
  const sourceText = String(text ?? '');
  const unique = new Set();

  // Design context attribute
  collectNodeIdsByPattern(
    sourceText,
    unique,
    /data-node-id=["']([^"']+)["']/gi
  );

  // Alternate attribute/JSON-like key
  collectNodeIdsByPattern(sourceText, unique, /node-id=["']([^"']+)["']/gi);
  collectNodeIdsByPattern(
    sourceText,
    unique,
    /["']node-id["']\s*:\s*["']([^"']+)["']/gi
  );
  collectNodeIdsByPattern(
    sourceText,
    unique,
    /["']nodeId["']\s*:\s*["']([^"']+)["']/g
  );
  collectNodeIdsByPattern(
    sourceText,
    unique,
    /\bnodeId\s*=\s*["']([^"']+)["']/g
  );

  // Conservative fallback for plain embedded ids
  if (unique.size === 0) {
    collectNodeIdsByPattern(
      sourceText,
      unique,
      /(?:^|[^0-9])((?:i)?\d+[:\-]\d+)(?!\d)/g
    );
  }

  return [...unique];
}

function normalizeNodeIdList(values) {
  if (!Array.isArray(values)) {
    return [];
  }
  const unique = new Set();
  for (const value of values) {
    const normalized = normalizeNodeId(value);
    if (normalized) {
      unique.add(normalized);
    }
  }
  return [...unique];
}

function countMatches(text, regex) {
  const matches = String(text ?? '').match(regex);
  return matches ? matches.length : 0;
}

function analyzeGraphicSignals(text) {
  const sourceText = String(text ?? '');
  const lower = sourceText.toLowerCase();
  const hasSvg = /<svg\b|\.svg\b|\bvector\b/.test(lower);
  const hasImage =
    /<img\b|\bimage\b|tool-assets\/|\.png\b|\.jpe?g\b|\.webp\b|\.gif\b/.test(
      lower
    );
  const hasIconKeyword = /\bicon\b|\bic_|\blogo\b|\bglyph\b|\bsymbol\b/.test(
    lower
  );
  const nestedNodeIds = extractChildNodeIdsFromText(sourceText);
  const assetPathCount = countMatches(sourceText, /tool-assets\//gi);

  return {
    hasSvg,
    hasImage,
    hasIconKeyword,
    hasGraphicSignal:
      hasSvg || hasImage || hasIconKeyword || assetPathCount > 0,
    nestedNodeCount: nestedNodeIds.length,
    assetPathCount,
  };
}

function summarizeCalls(calls) {
  const totals = {
    totalCalls: calls.length,
    okCalls: 0,
    failedCalls: 0,
    unavailableCalls: 0,
    graphicSignalCalls: 0,
  };

  for (const call of calls) {
    if (call.status === 'ok') {
      totals.okCalls += 1;
    } else if (call.status === 'unavailable') {
      totals.unavailableCalls += 1;
    } else {
      totals.failedCalls += 1;
    }

    if (call.graphicSignals?.hasGraphicSignal) {
      totals.graphicSignalCalls += 1;
    }
  }

  return totals;
}

function deriveProbeStatus(sessionOk, totals, candidateCount) {
  if (!sessionOk) {
    return 'unavailable';
  }
  if (candidateCount === 0) {
    return 'no_candidates';
  }
  if (totals.failedCalls > 0 || totals.unavailableCalls > 0) {
    return 'partial';
  }
  return 'ok';
}

function createUnavailableCalls(nodeIds, errorMessage) {
  return nodeIds.map((nodeId) => ({
    nodeId,
    tool: 'get_design_context',
    status: 'unavailable',
    error: errorMessage,
    durationMs: 0,
    graphicSignals: {
      hasSvg: false,
      hasImage: false,
      hasIconKeyword: false,
      hasGraphicSignal: false,
      nestedNodeCount: 0,
      assetPathCount: 0,
    },
  }));
}

function buildDocsHash(context) {
  return createCacheKey({
    sources: context.contracts?.sources || [],
    uiRulesContent: context.contracts?.uiRulesContent || '',
  });
}

function buildCacheKey({
  context,
  selectedNodeId,
  endpoint,
  maxCandidates,
  timeoutMs,
  additionalNodeIds,
  designContextFingerprint,
}) {
  return createCacheKey({
    schema: CACHE_SCHEMA_VERSION,
    figmaUrl: context.scenario.figma.url,
    selectedNodeId,
    endpoint,
    maxCandidates,
    timeoutMs,
    additionalNodeIds,
    gates: {
      assetCoverageMode: context.scenario.gates.assetCoverageMode,
      figmaMcpLogsMode: context.scenario.gates.figmaMcpLogsMode,
      designTokensMode: context.scenario.gates.designTokensMode,
      scopeGateMode: context.scenario.gates.scopeGateMode,
      intentMode: context.scenario.gates.intentMode,
      intentMinConfidence: context.scenario.gates.intentMinConfidence,
    },
    docsHash: buildDocsHash(context),
    designContextFingerprint,
  });
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
    context.figmaMcpDirectToolRecords?.get_metadata?.output;
  const designContextFingerprint = createCacheKey({
    selectedDesignContext,
    selectedMetadata: selectedMetadata || '',
  });
  const selectedGraphicSignals = analyzeGraphicSignals(selectedDesignContext);
  const overrideMaxCandidates = Number(
    context.assetProbeOverrides?.maxCandidates
  );
  const maxCandidates =
    Number.isInteger(overrideMaxCandidates) && overrideMaxCandidates > 0
      ? overrideMaxCandidates
      : context.scenario.figma.assetProbeMaxCandidates;
  const overrideTimeoutMs = Number(context.assetProbeOverrides?.timeoutMs);
  const timeoutMs =
    Number.isInteger(overrideTimeoutMs) && overrideTimeoutMs > 0
      ? overrideTimeoutMs
      : context.scenario.figma.assetProbeTimeoutMs;
  const additionalNodeIds = normalizeNodeIdList(
    context.assetProbeOverrides?.additionalNodeIds
  );

  const inferredChildNodeIds = [
    ...new Set([
      ...extractChildNodeIdsFromText(selectedDesignContext),
      ...extractChildNodeIdsFromText(selectedMetadata),
    ]),
  ].filter((nodeId) => nodeId !== selectedNodeId);
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
    return {
      status: cached.data.status,
      candidates: cached.data.selectedNode?.effectiveNodeIds?.length || 0,
      probed: cached.data.totals?.totalCalls ?? 0,
      okCalls: cached.data.totals?.okCalls ?? 0,
      failedCalls: cached.data.totals?.failedCalls ?? 0,
      unavailableCalls: cached.data.totals?.unavailableCalls ?? 0,
      selectedGraphicSignal: Boolean(
        cached.data.selectedNode?.graphicSignals?.hasGraphicSignal
      ),
      graphicSignals: cached.data.totals?.graphicSignalCalls ?? 0,
      source: 'cache',
      artifactPath: relative(context.rootPath, cached.artifactPath),
    };
  }

  const baseDir = resolve(
    context.artifactsDir,
    context.runId,
    'figma-asset-scope'
  );
  mkdirSync(baseDir, { recursive: true });

  if (childNodeIds.length === 0) {
    const capture = {
      schemaVersion: 'figma-asset-scope.v1',
      cache: {
        version: CACHE_SCHEMA_VERSION,
        key: cacheKey,
        createdAt: new Date().toISOString(),
      },
      collectedAt: new Date().toISOString(),
      figma: {
        url: context.scenario.figma.url,
        selectedNodeId,
      },
      config: {
        maxCandidates,
        timeoutMs,
        endpoint,
      },
      selectedNode: {
        nodeId: selectedNodeId,
        graphicSignals: selectedGraphicSignals,
        inferredChildNodeIds,
        additionalNodeIds,
        effectiveNodeIds: [],
      },
      calls: [],
      totals: {
        totalCalls: 0,
        okCalls: 0,
        failedCalls: 0,
        unavailableCalls: 0,
        graphicSignalCalls: 0,
      },
      status: 'no_candidates',
    };
    const artifactPath = resolve(
      context.artifactsDir,
      `${context.runId}-figma-asset-scope.json`
    );
    writeFileSync(artifactPath, JSON.stringify(capture, null, 2), 'utf8');

    context.figmaAssetScope = capture;
    context.figmaAssetScopeArtifactPath = artifactPath;
    return {
      status: 'no_candidates',
      candidates: 0,
      probed: 0,
      okCalls: 0,
      failedCalls: 0,
      unavailableCalls: 0,
      selectedGraphicSignal: selectedGraphicSignals.hasGraphicSignal,
      graphicSignals: 0,
      source: 'fresh',
      artifactPath: relative(context.rootPath, artifactPath),
    };
  }

  const auth = resolveFigmaMcpAuth(context.scenario);

  const session = initializeFigmaMcpSession({
    endpoint,
    timeoutMs,
    authToken: auth.token,
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
        authToken: auth.token,
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
  const capture = {
    schemaVersion: 'figma-asset-scope.v1',
    cache: {
      version: CACHE_SCHEMA_VERSION,
      key: cacheKey,
      createdAt: new Date().toISOString(),
    },
    collectedAt: new Date().toISOString(),
    figma: {
      url: context.scenario.figma.url,
      selectedNodeId,
    },
    config: {
      maxCandidates,
      timeoutMs,
      endpoint,
    },
    selectedNode: {
      nodeId: selectedNodeId,
      graphicSignals: selectedGraphicSignals,
      inferredChildNodeIds,
      additionalNodeIds,
      effectiveNodeIds: childNodeIds,
    },
    calls,
    totals,
    status,
  };

  const artifactPath = resolve(
    context.artifactsDir,
    `${context.runId}-figma-asset-scope.json`
  );
  writeFileSync(artifactPath, JSON.stringify(capture, null, 2), 'utf8');

  context.figmaAssetScope = capture;
  context.figmaAssetScopeArtifactPath = artifactPath;

  return {
    status,
    candidates: childNodeIds.length,
    probed: totals.totalCalls,
    okCalls: totals.okCalls,
    failedCalls: totals.failedCalls,
    unavailableCalls: totals.unavailableCalls,
    selectedGraphicSignal: selectedGraphicSignals.hasGraphicSignal,
    graphicSignals: totals.graphicSignalCalls,
    source: 'fresh',
    artifactPath: relative(context.rootPath, artifactPath),
  };
}
