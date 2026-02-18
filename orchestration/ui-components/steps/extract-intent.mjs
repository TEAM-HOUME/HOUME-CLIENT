import { writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { invokeAgentWithSchema } from '../lib/agent.mjs';
import { readContracts } from '../lib/contracts.mjs';
import { collectIntentCodebaseGuidance } from '../lib/feedback/intent-codebase-guidance.mjs';

const COMPONENT_KIND_ENUM = [
  'toast',
  'snackbar',
  'modal',
  'bottom_sheet',
  'dialog',
  'sheet',
  'drawer',
  'banner',
  'tooltip',
  'chip',
  'unknown',
];
const ROLE_ENUM = ['global', 'local', 'inline', 'unknown'];

function normalizeEnum(value, allowed, fallback) {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  if (allowed.includes(normalized)) {
    return normalized;
  }
  return fallback;
}

function normalizeArray(values) {
  if (!Array.isArray(values)) {
    return [];
  }
  return [
    ...new Set(values.map((value) => String(value).trim()).filter(Boolean)),
  ];
}

function normalizeConfidence(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return Math.min(1, Math.max(0, numeric));
}

function dedupeFeedbackNotes(notes, limit = 2) {
  if (!Array.isArray(notes)) {
    return [];
  }
  const unique = [];
  const seen = new Set();
  for (const note of notes) {
    const normalized = String(note ?? '').trim();
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    unique.push(normalized);
  }
  return unique.slice(-limit);
}

function buildPrompt(context) {
  const intent = context.scenario.intent;
  const feedbackNotes = dedupeFeedbackNotes(context.feedbackLoop?.intent);
  const contracts = context.contracts;
  const codebaseGuidance = collectIntentCodebaseGuidance(context);
  const uiRuleSources =
    contracts &&
    Array.isArray(contracts.sources) &&
    contracts.sources.length > 0
      ? contracts.sources.join(', ')
      : '(none)';
  const uiRulesContent = String(contracts?.uiRulesContent || '').trim();
  const hintLines = [];
  if (intent.pageHint) {
    hintLines.push(`- page hint: ${intent.pageHint}`);
  }
  if (intent.componentKindHint) {
    hintLines.push(`- component kind hint: ${intent.componentKindHint}`);
  }
  if (intent.roleHint) {
    hintLines.push(`- role hint: ${intent.roleHint}`);
  }
  if (intent.stateHint) {
    hintLines.push(`- state hint: ${intent.stateHint}`);
  }
  if (intent.notes) {
    hintLines.push(`- notes: ${intent.notes}`);
  }
  const codebaseSummaryLines =
    codebaseGuidance && Array.isArray(codebaseGuidance.summaryLines)
      ? codebaseGuidance.summaryLines
      : ['- 코드베이스 스냅샷을 찾지 못했습니다.'];
  const codebaseDefaultNote =
    codebaseGuidance && codebaseGuidance.defaultNote
      ? codebaseGuidance.defaultNote
      : '';

  return [
    'You are resolving implementation intent from a short product brief.',
    `Figma URL: ${context.scenario.figma.url}`,
    `Brief: ${intent.brief}`,
    hintLines.length > 0 ? 'Optional hints:' : 'Optional hints: (none)',
    ...hintLines,
    feedbackNotes.length > 0
      ? 'Retry clarification notes (highest priority):'
      : 'Retry clarification notes: (none)',
    ...feedbackNotes.map((note, index) => `- [${index + 1}] ${note}`),
    '',
    `Project UI rule docs: ${uiRuleSources}`,
    uiRulesContent
      ? 'Project UI rules and codebase conventions (authoritative):'
      : 'Project UI rules and codebase conventions: (none)',
    uiRulesContent,
    '',
    'Current codebase baseline snapshot (must be considered first):',
    ...codebaseSummaryLines,
    ...(codebaseDefaultNote
      ? [`- Default policy suggestion: ${codebaseDefaultNote}`]
      : []),
    '',
    'Rules:',
    '- Keep this read-only and do not edit files.',
    '- Return structured intent for UI implementation only.',
    '- Use the current codebase baseline snapshot as primary behavior fallback when brief/hints are ambiguous.',
    '- Focus on UI behavior/spec gaps only; do not mention tooling/setup topics.',
    '- Do not ask for or suggest Code Connect integration.',
    '- Do not include MCP auth/token/tool availability as ambiguities.',
    '- Use componentKind enum values exactly.',
    '- Use role enum values exactly.',
    '- confidence must be between 0 and 1.',
    '- Put unresolved aspects in ambiguities.',
    '- summary and ambiguities must be written in Korean only.',
    'Return JSON only matching the schema.',
  ].join('\n');
}

export function stepExtractIntent(context) {
  if (context.options.dryRun) {
    return {
      skipped: true,
      reason: '--dry-run option',
    };
  }

  if (!context.contracts) {
    context.contracts = readContracts(context.rootPath);
  }

  const schema = {
    type: 'object',
    properties: {
      page: { type: 'string' },
      componentKind: {
        type: 'string',
        enum: COMPONENT_KIND_ENUM,
      },
      role: {
        type: 'string',
        enum: ROLE_ENUM,
      },
      state: { type: 'string' },
      summary: { type: 'string' },
      behaviorNeeded: { type: 'boolean' },
      confidence: { type: 'number' },
      ambiguities: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: [
      'page',
      'componentKind',
      'role',
      'state',
      'summary',
      'behaviorNeeded',
      'confidence',
      'ambiguities',
    ],
    additionalProperties: false,
  };

  const result = invokeAgentWithSchema(
    context,
    'intent-resolve',
    buildPrompt(context),
    schema,
    Math.min(context.scenario.figma.timeoutMs, 180_000)
  );
  const codebaseGuidance = collectIntentCodebaseGuidance(context);

  const resolvedIntent = {
    brief: context.scenario.intent.brief,
    page: String(result.page ?? '').trim(),
    componentKind: normalizeEnum(
      result.componentKind,
      COMPONENT_KIND_ENUM,
      'unknown'
    ),
    role: normalizeEnum(result.role, ROLE_ENUM, 'unknown'),
    state: String(result.state ?? '').trim(),
    summary: String(result.summary ?? '').trim(),
    behaviorNeeded: Boolean(result.behaviorNeeded),
    confidence: normalizeConfidence(result.confidence),
    ambiguities: normalizeArray(result.ambiguities),
  };

  const intentArtifact = {
    ...resolvedIntent,
    codebaseGuidance: codebaseGuidance
      ? {
          summaryLines: codebaseGuidance.summaryLines,
          references: codebaseGuidance.references,
          defaultNote: codebaseGuidance.defaultNote,
        }
      : null,
  };
  const artifactPath = resolve(
    context.artifactsDir,
    `${context.runId}-intent.json`
  );
  writeFileSync(artifactPath, JSON.stringify(intentArtifact, null, 2), 'utf8');

  context.resolvedIntent = resolvedIntent;
  context.intentArtifactPath = artifactPath;

  return {
    componentKind: resolvedIntent.componentKind,
    role: resolvedIntent.role,
    state: resolvedIntent.state,
    confidence: resolvedIntent.confidence,
    ambiguities: resolvedIntent.ambiguities,
    behaviorNeeded: resolvedIntent.behaviorNeeded,
    codebaseSummaryLines: codebaseGuidance?.summaryLines || [],
    codebaseReferenceCount: codebaseGuidance?.references?.length || 0,
    codebaseDefaultNote: codebaseGuidance?.defaultNote || '',
    artifactPath: relative(context.rootPath, artifactPath),
  };
}
