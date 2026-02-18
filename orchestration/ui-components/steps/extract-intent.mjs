import { writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { invokeAgentWithSchema } from '../lib/agent.mjs';
import { readContracts } from '../lib/contracts.mjs';
import {
  COMPONENT_KIND_ENUM,
  ROLE_ENUM,
  normalizeComponentKind,
  normalizeRole,
} from '../lib/intent-taxonomy.mjs';

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

function normalizeCodebaseReferences(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  const normalized = [];
  const seen = new Set();

  for (const item of values) {
    if (!item) {
      continue;
    }

    let path = '';
    let reason = '';

    if (typeof item === 'string') {
      path = item.trim();
      reason = '코드베이스 참고';
    } else if (typeof item === 'object') {
      path = String(item.path ?? '').trim();
      reason = String(item.reason ?? '').trim();
    } else {
      continue;
    }

    if (!path && !reason) {
      continue;
    }

    const normalizedPath = path ? path.replace(/\\/g, '/') : '(unknown)';
    const normalizedReason = reason || '근거 미기재';
    const key = `${normalizedPath}::${normalizedReason}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    normalized.push({
      path: normalizedPath,
      reason: normalizedReason,
    });
  }

  return normalized.slice(0, 5);
}

function getPreviousCodebaseEvidenceLines(context) {
  const attempt = Number(context?.stepAttemptCounts?.['extract-intent'] || 1);
  if (attempt <= 1) {
    return [];
  }

  const previousReferences = normalizeCodebaseReferences(
    context?.resolvedIntent?.codebaseReferences
  );
  return previousReferences.map((item) => `${item.path}: ${item.reason}`);
}

function buildPrompt(context) {
  const intent = context.scenario.intent;
  const feedbackNotes = dedupeFeedbackNotes(context.feedbackLoop?.intent);
  const previousCodebaseEvidenceLines =
    getPreviousCodebaseEvidenceLines(context);
  const contracts = context.contracts;
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

  return [
    'You are resolving implementation intent from a short product brief.',
    'Stage: extract-intent',
    'Purpose: Resolve implementation intent from brief and repository evidence.',
    `Figma URL: ${context.scenario.figma.url}`,
    `Brief: ${intent.brief}`,
    hintLines.length > 0 ? 'Optional hints:' : 'Optional hints: (none)',
    ...hintLines,
    feedbackNotes.length > 0
      ? 'Retry clarification notes (highest priority):'
      : 'Retry clarification notes: (none)',
    ...feedbackNotes.map((note, index) => `- [${index + 1}] ${note}`),
    previousCodebaseEvidenceLines.length > 0
      ? 'Previous attempt codebase evidence (same run, advisory):'
      : 'Previous attempt codebase evidence: (none)',
    ...previousCodebaseEvidenceLines.map((line) => `- ${line}`),
    '',
    `Project UI rule docs: ${uiRuleSources}`,
    uiRulesContent
      ? 'Project UI rules and codebase conventions (authoritative):'
      : 'Project UI rules and codebase conventions: (none)',
    uiRulesContent,
    '',
    'Rules:',
    '- Keep this read-only and do not edit files.',
    '- You must inspect existing code patterns in this repository before finalizing intent.',
    '- Prioritize relevant files under src/shared/components and src/stories as first-pass evidence.',
    '- Return codebaseReferences with concrete repository-relative file paths and why each matters.',
    '- If no relevant file exists, return codebaseReferences as an empty array.',
    '- Return structured intent for UI implementation only.',
    '- Use existing codebase behavior as primary fallback when brief/hints are ambiguous.',
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
      codebaseReferences: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            path: { type: 'string' },
            reason: { type: 'string' },
          },
          required: ['path', 'reason'],
          additionalProperties: false,
        },
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
      'codebaseReferences',
    ],
    additionalProperties: false,
  };

  const result = invokeAgentWithSchema(
    context,
    'intent-resolve',
    buildPrompt(context),
    schema,
    context.scenario.figma.timeoutMs
  );

  const resolvedIntent = {
    brief: context.scenario.intent.brief,
    page: String(result.page ?? '').trim(),
    componentKind: normalizeComponentKind(result.componentKind, 'unknown'),
    role: normalizeRole(result.role, 'unknown'),
    state: String(result.state ?? '').trim(),
    summary: String(result.summary ?? '').trim(),
    behaviorNeeded: Boolean(result.behaviorNeeded),
    confidence: normalizeConfidence(result.confidence),
    ambiguities: normalizeArray(result.ambiguities),
    codebaseReferences: normalizeCodebaseReferences(result.codebaseReferences),
  };

  const intentArtifact = {
    ...resolvedIntent,
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
    codebaseSummaryLines: resolvedIntent.codebaseReferences.map(
      (item) => `${item.path}: ${item.reason}`
    ),
    codebaseReferenceCount: resolvedIntent.codebaseReferences.length,
    artifactPath: relative(context.rootPath, artifactPath),
  };
}
