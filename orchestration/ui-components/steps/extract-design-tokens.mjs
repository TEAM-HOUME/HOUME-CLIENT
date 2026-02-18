import { writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { findCachedArtifact } from '../lib/artifact-cache.mjs';
import { invokeAgentWithSchema } from '../lib/agent.mjs';
import {
  buildCacheKey,
  buildCaptureFromAgentResult,
  buildPrompt,
  buildSchema,
  createFallbackCapture,
} from './design-tokens/builders.mjs';

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

function buildStepOutputFromCapture(context, capture, source, artifactPath) {
  return {
    status: capture.status,
    totalTokens: capture.stats?.totalTokens ?? 0,
    coreCoverage: capture.stats?.coreCoverage ?? 0,
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
  context.designTokens = capture;
  context.designTokensArtifactPath = artifactPath;
  return artifactPath;
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
    context.designTokens = cached.data;
    context.designTokensArtifactPath = cached.artifactPath;
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
    const result = invokeAgentWithSchema(
      context,
      'design-tokens',
      buildPrompt(context),
      buildSchema(),
      context.scenario.figma.timeoutMs
    );
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
