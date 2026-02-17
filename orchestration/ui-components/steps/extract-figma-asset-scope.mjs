import { mkdirSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import {
  callFigmaMcpTool,
  classifyJsonRpcCall,
  extractToolTextOutput,
  initializeFigmaMcpSession,
} from '../lib/figma-mcp-direct.mjs';
import { resolveFigmaMcpAuth } from '../lib/figma-mcp-auth.mjs';

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

function extractChildNodeIdsFromDesignContext(text) {
  const matches = String(text ?? '').matchAll(
    /data-node-id=["']([^"']+)["']/gi
  );
  const unique = new Set();
  for (const match of matches) {
    const normalized = normalizeNodeId(match[1]);
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
  const nestedNodeIds = extractChildNodeIdsFromDesignContext(sourceText);
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
  const selectedGraphicSignals = analyzeGraphicSignals(selectedDesignContext);
  const childNodeIds = extractChildNodeIdsFromDesignContext(
    selectedDesignContext
  )
    .filter((nodeId) => nodeId !== selectedNodeId)
    .slice(0, context.scenario.figma.assetProbeMaxCandidates);

  const endpoint = context.scenario.figma.mcpEndpoint;
  const timeoutMs = context.scenario.figma.assetProbeTimeoutMs;
  const baseDir = resolve(
    context.artifactsDir,
    context.runId,
    'figma-asset-scope'
  );
  mkdirSync(baseDir, { recursive: true });

  if (childNodeIds.length === 0) {
    const capture = {
      schemaVersion: 'figma-asset-scope.v1',
      collectedAt: new Date().toISOString(),
      figma: {
        url: context.scenario.figma.url,
        selectedNodeId,
      },
      config: {
        maxCandidates: context.scenario.figma.assetProbeMaxCandidates,
        timeoutMs,
        endpoint,
      },
      selectedNode: {
        nodeId: selectedNodeId,
        graphicSignals: selectedGraphicSignals,
        inferredChildNodeIds: [],
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
    collectedAt: new Date().toISOString(),
    figma: {
      url: context.scenario.figma.url,
      selectedNodeId,
    },
    config: {
      maxCandidates: context.scenario.figma.assetProbeMaxCandidates,
      timeoutMs,
      endpoint,
    },
    selectedNode: {
      nodeId: selectedNodeId,
      graphicSignals: selectedGraphicSignals,
      inferredChildNodeIds: childNodeIds,
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
    artifactPath: relative(context.rootPath, artifactPath),
  };
}
