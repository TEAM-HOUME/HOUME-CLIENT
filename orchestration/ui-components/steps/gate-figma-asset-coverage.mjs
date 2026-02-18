import { writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { invokeAgentWithSchema } from '../lib/agent.mjs';
import { fail } from '../lib/errors.mjs';
import { enforceMcpGuardrails } from '../lib/mcp-guardrails.mjs';
import { buildRunContextLines } from '../lib/prompt-run-context.mjs';

const COVERAGE_STATUS_VALUES = new Set(['covered', 'missing', 'unknown']);

function normalizeCoverageStatus(value) {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();
  if (COVERAGE_STATUS_VALUES.has(normalized)) {
    return normalized;
  }
  return 'unknown';
}

function normalizeStringList(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => String(item ?? '').trim()).filter(Boolean);
}

function normalizeConfidence(value) {
  const confidence = Number(value);
  if (!Number.isFinite(confidence)) {
    return 0;
  }
  return Math.min(1, Math.max(0, confidence));
}

function failOrWarn(context, mode, message) {
  if (mode === 'error') {
    fail(message);
  }
  context.warnings.push(message);
}

function buildPrompt(context) {
  const intent = context.resolvedIntent || {};
  const feedbackNotes = Array.isArray(context.feedbackLoop?.asset)
    ? context.feedbackLoop.asset.filter(Boolean)
    : [];
  const designTokensPath = context.designTokensArtifactPath
    ? relative(context.rootPath, context.designTokensArtifactPath)
    : '(missing)';
  const assetScopePath = context.figmaAssetScopeArtifactPath
    ? relative(context.rootPath, context.figmaAssetScopeArtifactPath)
    : '(missing)';
  const runContextLines = buildRunContextLines(context, {
    stageName: 'gate-figma-asset-coverage',
    stagePurpose:
      'Judge whether visual assets are covered by current context evidence.',
    successCriteria: [
      'Return covered/missing/unknown with confidence.',
      'Provide Korean reasons and suggestedActions.',
    ],
  });

  return [
    'You are validating visual asset coverage for a Figma implementation scope.',
    ...runContextLines,
    '',
    `Figma URL: ${context.scenario.figma.url}`,
    `Scope node-id: ${context.figmaScope.selectedNodeId}`,
    `Brief: ${context.scenario.intent.brief}`,
    `Intent: component=${intent.componentKind || 'unknown'}, state=${intent.state || 'unknown'}, role=${intent.role || 'unknown'}`,
    '',
    'Use these artifacts:',
    `- Design tokens + MCP evidence: ${designTokensPath}`,
    `- Child asset probe result: ${assetScopePath}`,
    '',
    ...(feedbackNotes.length > 0
      ? [
          'Retry feedback notes:',
          ...feedbackNotes.map((note, index) => `- ${index + 1}. ${note}`),
          '',
        ]
      : []),
    '',
    'Task:',
    '- Inspect screenshot evidence from design-token MCP capture for the selected node.',
    '- Compare visible icon/image/logo/vector presence against extracted context (selected node + child probes).',
    '- Decide whether the current context likely misses visible graphic assets.',
    '',
    'Rules:',
    '- covered: visual assets are sufficiently represented in current context.',
    '- missing: screenshot shows visible graphic assets not represented in context.',
    '- unknown: cannot decide confidently from available evidence.',
    '- missingElements, reasons, suggestedActions must be written in Korean.',
    '- Do not edit files.',
    '- Return JSON only that matches the schema.',
  ].join('\n');
}

function createFallbackAssessment(message) {
  return {
    coverageStatus: 'unknown',
    confidence: 0,
    visualHasGraphicAsset: false,
    contextHasGraphicAsset: false,
    missingElements: [],
    reasons: [message],
    suggestedActions: ['아티팩트를 확인한 뒤 다시 실행하세요'],
  };
}

export function stepGateAssetCoverage(context) {
  if (context.options.dryRun) {
    return {
      skipped: true,
      reason: '--dry-run option',
    };
  }

  const mode = context.scenario.gates.assetCoverageMode;
  if (mode === 'off') {
    return {
      skipped: true,
      reason: '`gates.asset_coverage_mode` is off',
    };
  }

  if (!context.figmaAssetScope) {
    failOrWarn(context, mode, 'Figma 자산 스코프 추출 결과가 없습니다.');
    context.figmaAssetCoverageGate = {
      mode,
      status: mode === 'error' ? 'blocked' : 'missing-warning',
      coverageStatus: 'unknown',
      confidence: 0,
      missingCount: 0,
    };
    return context.figmaAssetCoverageGate;
  }

  if (context.figmaAssetScope.status === 'unavailable') {
    failOrWarn(
      context,
      mode,
      'Figma 자산 스코프 추출을 사용할 수 없습니다 (MCP/도구 실패).'
    );
  }

  const schema = {
    type: 'object',
    properties: {
      coverageStatus: {
        type: 'string',
        enum: ['covered', 'missing', 'unknown'],
      },
      confidence: { type: 'number' },
      visualHasGraphicAsset: { type: 'boolean' },
      contextHasGraphicAsset: { type: 'boolean' },
      missingElements: {
        type: 'array',
        items: { type: 'string' },
      },
      reasons: {
        type: 'array',
        items: { type: 'string' },
      },
      suggestedActions: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: [
      'coverageStatus',
      'confidence',
      'visualHasGraphicAsset',
      'contextHasGraphicAsset',
      'missingElements',
      'reasons',
      'suggestedActions',
    ],
    additionalProperties: false,
  };

  let rawAssessment;
  let extractionMessage = null;
  try {
    rawAssessment = invokeAgentWithSchema(
      context,
      'figma-asset-coverage',
      buildPrompt(context),
      schema,
      context.scenario.figma.timeoutMs
    );
    enforceMcpGuardrails(context, 'figma-asset-coverage');
  } catch (error) {
    extractionMessage =
      error instanceof Error
        ? error.message
        : `Unknown error: ${String(error)}`;
    rawAssessment = createFallbackAssessment(extractionMessage);
    failOrWarn(
      context,
      mode,
      `자산 커버리지 판정에 실패했습니다: ${extractionMessage}`
    );
  }

  const assessment = {
    coverageStatus: normalizeCoverageStatus(rawAssessment.coverageStatus),
    confidence: normalizeConfidence(rawAssessment.confidence),
    visualHasGraphicAsset: Boolean(rawAssessment.visualHasGraphicAsset),
    contextHasGraphicAsset: Boolean(rawAssessment.contextHasGraphicAsset),
    missingElements: normalizeStringList(rawAssessment.missingElements),
    reasons: normalizeStringList(rawAssessment.reasons),
    suggestedActions: normalizeStringList(rawAssessment.suggestedActions),
  };

  const artifactPath = resolve(
    context.artifactsDir,
    `${context.runId}-figma-asset-coverage.json`
  );
  writeFileSync(
    artifactPath,
    JSON.stringify(
      {
        schemaVersion: 'figma-asset-coverage.v1',
        assessedAt: new Date().toISOString(),
        mode,
        assessment,
        extractionMessage,
      },
      null,
      2
    ),
    'utf8'
  );
  context.figmaAssetCoverageArtifactPath = artifactPath;

  let status = 'ok';
  if (assessment.coverageStatus === 'missing') {
    status = mode === 'error' ? 'blocked' : 'missing-warning';
    failOrWarn(
      context,
      mode,
      `시각 자산 커버리지 불일치가 감지되었습니다: ${assessment.missingElements.join(' | ') || '스크린샷/컨텍스트 불일치'}`
    );
  } else if (assessment.coverageStatus === 'unknown') {
    status = mode === 'error' ? 'blocked' : 'unknown-warning';
    failOrWarn(
      context,
      mode,
      `시각 자산 커버리지를 확정할 수 없습니다: ${assessment.reasons.join(' | ') || '근거 부족'}`
    );
  }

  context.figmaAssetCoverageGate = {
    mode,
    status,
    coverageStatus: assessment.coverageStatus,
    confidence: assessment.confidence,
    missingCount: assessment.missingElements.length,
    visualHasGraphicAsset: assessment.visualHasGraphicAsset,
    contextHasGraphicAsset: assessment.contextHasGraphicAsset,
    reasons: assessment.reasons,
    suggestedActions: assessment.suggestedActions,
    artifactPath: relative(context.rootPath, artifactPath),
  };

  return context.figmaAssetCoverageGate;
}
