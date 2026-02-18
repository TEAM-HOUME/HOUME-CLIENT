import { writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { createCacheKey } from '../../lib/artifact-cache.mjs';
import { CACHE_SCHEMA_VERSION } from './constants.mjs';

function buildDocsHash(context) {
  return createCacheKey({
    sources: context.contracts?.sources || [],
    uiRulesContent: context.contracts?.uiRulesContent || '',
  });
}

export function buildCacheKey(context, nodeId) {
  return createCacheKey({
    schema: CACHE_SCHEMA_VERSION,
    figmaUrl: context.scenario.figma.url,
    selectedNodeId: nodeId,
    endpoint: context.scenario.figma.mcpEndpoint,
    figmaTimeoutMs: context.scenario.figma.timeoutMs,
    gates: {
      figmaMcpLogsMode: context.scenario.gates.figmaMcpLogsMode,
      scopeGateMode: context.scenario.gates.scopeGateMode,
      intentMode: context.scenario.gates.intentMode,
      assetCoverageMode: context.scenario.gates.assetCoverageMode,
      designTokensMode: context.scenario.gates.designTokensMode,
      intentMinConfidence: context.scenario.gates.intentMinConfidence,
    },
    docsHash: buildDocsHash(context),
  });
}

function safeFilename(value) {
  return String(value)
    .trim()
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

export function writeCallArtifacts(
  context,
  baseDir,
  order,
  label,
  callRecord,
  state
) {
  const safeLabel = safeFilename(label || `call-${order}`);
  const prefix = `${String(order).padStart(2, '0')}-${safeLabel}`;
  const requestPath = resolve(baseDir, `${prefix}.request.json`);
  const responseRawPath = resolve(baseDir, `${prefix}.response.raw.txt`);
  const responseParsedPath = resolve(baseDir, `${prefix}.response.parsed.json`);
  const summaryPath = resolve(baseDir, `${prefix}.summary.json`);

  writeFileSync(
    requestPath,
    JSON.stringify(callRecord.payload, null, 2),
    'utf8'
  );
  writeFileSync(responseRawPath, callRecord.response.bodyRaw || '', 'utf8');
  writeFileSync(
    responseParsedPath,
    JSON.stringify(callRecord.response.parsedJsonRpc ?? null, null, 2),
    'utf8'
  );
  writeFileSync(
    summaryPath,
    JSON.stringify(
      {
        label,
        status: state.status,
        error: state.error,
        sessionId: callRecord.sessionId,
        httpStatus: callRecord.response.statusCode,
        durationMs: callRecord.response.durationMs,
        contentType: callRecord.response.contentType,
      },
      null,
      2
    ),
    'utf8'
  );

  return {
    label,
    status: state.status,
    error: state.error,
    httpStatus: callRecord.response.statusCode,
    durationMs: callRecord.response.durationMs,
    requestPath: relative(context.rootPath, requestPath),
    responseRawPath: relative(context.rootPath, responseRawPath),
    responseParsedPath: relative(context.rootPath, responseParsedPath),
    summaryPath: relative(context.rootPath, summaryPath),
  };
}

export function summarizeToolCalls(toolCalls) {
  const summary = {
    totalCalls: toolCalls.length,
    okCalls: 0,
    failedCalls: 0,
    unavailableCalls: 0,
  };

  for (const call of toolCalls) {
    if (call.status === 'ok') {
      summary.okCalls += 1;
      continue;
    }
    if (call.status === 'unavailable') {
      summary.unavailableCalls += 1;
      continue;
    }
    summary.failedCalls += 1;
  }

  return summary;
}

export function buildStepOutput(
  context,
  nodeId,
  calls,
  totals,
  source,
  artifactPath
) {
  return {
    selectedNodeId: nodeId,
    tools: calls.length,
    okCalls: totals?.okCalls ?? 0,
    failedCalls: totals?.failedCalls ?? 0,
    unavailableCalls: totals?.unavailableCalls ?? 0,
    source,
    artifactPath: relative(context.rootPath, artifactPath),
  };
}
