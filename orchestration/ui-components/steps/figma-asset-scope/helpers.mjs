import { createCacheKey } from '../../lib/artifact-cache.mjs';

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

export function extractChildNodeIdsFromText(text) {
  const sourceText = String(text ?? '');
  const unique = new Set();

  collectNodeIdsByPattern(
    sourceText,
    unique,
    /data-node-id=["']([^"']+)["']/gi
  );
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

  if (unique.size === 0) {
    collectNodeIdsByPattern(
      sourceText,
      unique,
      /(?:^|[^0-9])((?:i)?\d+[:\-]\d+)(?!\d)/g
    );
  }

  return [...unique];
}

export function normalizeNodeIdList(values) {
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

export function analyzeGraphicSignals(text) {
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

export function summarizeCalls(calls) {
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

export function deriveProbeStatus(sessionOk, totals, candidateCount) {
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

export function createUnavailableCalls(nodeIds, errorMessage) {
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

export function buildCacheKey({
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

export function createNoCandidatesCapture({
  cacheKey,
  context,
  selectedNodeId,
  selectedGraphicSignals,
  inferredChildNodeIds,
  additionalNodeIds,
  maxCandidates,
  timeoutMs,
  endpoint,
}) {
  return {
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
}

export function createCapture({
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
}) {
  return {
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
}
