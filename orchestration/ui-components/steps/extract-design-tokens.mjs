import { mkdirSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { findCachedArtifact } from '../lib/artifact-cache.mjs';
import { invokeAgentWithSchema } from '../lib/agent.mjs';
import {
  enforceMcpGuardrails,
  FIGMA_REQUIRED_TOOLS,
} from '../lib/mcp-guardrails.mjs';
import {
  buildCacheKey,
  buildCaptureFromAgentResult,
  buildPrompt,
  buildSchema,
  createFallbackCapture,
} from './design-tokens/builders.mjs';
import { normalizeStatus as normalizeDesignTokenStatus } from './design-tokens/normalize.mjs';

function getCachedCapture(context, cacheKey) {
  return findCachedArtifact({
    artifactsDir: context.artifactsDir,
    suffix: '-design-tokens.json',
    cacheKey,
    accept: (data) =>
      data?.figma?.url === context.scenario.figma.url &&
      data?.figma?.selectedNodeId === context.figmaScope.selectedNodeId &&
      data?.stats &&
      data?.normalized,
  });
}

function buildToolCoverage(capture) {
  const requiredTools = FIGMA_REQUIRED_TOOLS;
  const toolRecords = Object.values(capture?.tools || {}).filter(
    (record) => record && typeof record === 'object'
  );
  const okTools = new Set(
    toolRecords
      .filter((record) => normalizeDesignTokenStatus(record.status) === 'ok')
      .map((record) => String(record.tool || '').trim())
      .filter(Boolean)
  );
  const coveredTools = requiredTools.filter((tool) => okTools.has(tool));
  return {
    requiredTools: requiredTools.length,
    coveredTools: coveredTools.length,
  };
}

function buildDirectToolRecordsFromCapture(capture) {
  const records = {};
  const toolRecords = Object.values(capture?.tools || {});
  for (const record of toolRecords) {
    const toolName = String(record?.tool || '').trim();
    if (!toolName) {
      continue;
    }
    records[toolName] = {
      tool: toolName,
      status: normalizeDesignTokenStatus(record?.status),
      output: String(record?.output || ''),
      error: String(record?.error || ''),
    };
  }
  return records;
}

function applyCaptureToContext(context, capture, artifactPath) {
  context.designTokens = capture;
  context.designTokensArtifactPath = artifactPath;
  context.figmaMcpDirectToolRecords =
    buildDirectToolRecordsFromCapture(capture);
}

function buildStepOutputFromCapture(context, capture, source, artifactPath) {
  const toolCoverage = buildToolCoverage(capture);
  return {
    status: capture.status,
    totalTokens: capture.stats?.totalTokens ?? 0,
    coreCoverage: capture.stats?.coreCoverage ?? 0,
    requiredTools: toolCoverage.requiredTools,
    coveredTools: toolCoverage.coveredTools,
    warnings: capture.diagnostics?.warnings || [],
    errors: capture.diagnostics?.errors || [],
    source,
    artifactPath: relative(context.rootPath, artifactPath),
  };
}

function writeCaptureArtifact(context, capture) {
  const artifactPath = resolve(
    context.artifactsDir,
    `${context.runId}-design-tokens.json`
  );
  writeFileSync(artifactPath, JSON.stringify(capture, null, 2), 'utf8');
  applyCaptureToContext(context, capture, artifactPath);
  return artifactPath;
}

function ensureDesignTokenAssetWriteDir(context) {
  const assetWriteDir = resolve(
    context.artifactsDir,
    context.runId,
    'figma-design-token-assets'
  );
  mkdirSync(assetWriteDir, { recursive: true });
  return assetWriteDir;
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

  const cacheKey = buildCacheKey(context);
  const cached = getCachedCapture(context, cacheKey);
  if (cached) {
    applyCaptureToContext(context, cached.data, cached.artifactPath);
    return buildStepOutputFromCapture(
      context,
      cached.data,
      'cache',
      cached.artifactPath
    );
  }

  let capture;
  let extractionMessage = null;

  try {
    const assetWriteDir = ensureDesignTokenAssetWriteDir(context);
    const result = invokeAgentWithSchema(
      context,
      'design-tokens',
      buildPrompt(context, { assetWriteDir }),
      buildSchema(),
      context.scenario.figma.timeoutMs
    );
    enforceMcpGuardrails(context, 'design-tokens');
    capture = buildCaptureFromAgentResult(context, result, cacheKey);
  } catch (error) {
    extractionMessage =
      error instanceof Error
        ? error.message
        : `Unknown error: ${String(error)}`;
    capture = createFallbackCapture(context, extractionMessage, cacheKey);

    if (context.scenario.gates.designTokensMode === 'error') {
      throw error;
    }
    context.warnings.push(`디자인 토큰 추출 경고: ${extractionMessage}`);
  }

  const artifactPath = writeCaptureArtifact(context, capture);
  return {
    ...buildStepOutputFromCapture(context, capture, 'fresh', artifactPath),
    extractionMessage,
  };
}
