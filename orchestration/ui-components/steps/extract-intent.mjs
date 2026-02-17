import { writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { invokeAgentWithSchema } from '../lib/agent.mjs';

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

function buildPrompt(context) {
  const intent = context.scenario.intent;
  const feedbackNotes = Array.isArray(context.feedbackLoop?.intent)
    ? context.feedbackLoop.intent.filter(Boolean)
    : [];
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
    'Rules:',
    '- Keep this read-only and do not edit files.',
    '- Return structured intent for UI implementation only.',
    '- Use componentKind enum values exactly.',
    '- Use role enum values exactly.',
    '- confidence must be between 0 and 1.',
    '- Put unresolved aspects in ambiguities.',
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

  const artifactPath = resolve(
    context.artifactsDir,
    `${context.runId}-intent.json`
  );
  writeFileSync(artifactPath, JSON.stringify(resolvedIntent, null, 2), 'utf8');

  context.resolvedIntent = resolvedIntent;
  context.intentArtifactPath = artifactPath;

  return {
    componentKind: resolvedIntent.componentKind,
    role: resolvedIntent.role,
    state: resolvedIntent.state,
    confidence: resolvedIntent.confidence,
    ambiguities: resolvedIntent.ambiguities,
    behaviorNeeded: resolvedIntent.behaviorNeeded,
    artifactPath: relative(context.rootPath, artifactPath),
  };
}
