import { existsSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { invokeAgentWithSchema } from '../lib/agent.mjs';
import { readContracts } from '../lib/contracts.mjs';
import { fail } from '../lib/errors.mjs';
import { INTERACTION_COMPONENT_KINDS } from '../lib/intent-taxonomy.mjs';

const INTERACTION_KEYWORDS = [
  'modal',
  'bottomsheet',
  'bottom-sheet',
  'sheet',
  'dialog',
  'drawer',
  'popover',
  'menu',
  'dropdown',
  'context-menu',
  'context_menu',
  'select',
  'combobox',
  'date',
  'datepicker',
  'date-picker',
  'time',
  'timepicker',
  'time-picker',
  'upload',
  'file-upload',
  'accordion',
  'carousel',
  'segment',
  'segmented',
  'slider',
  'range-slider',
  'tabs',
];

function normalizePath(value) {
  return String(value ?? '')
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\.\//, '');
}

function isLikelyInteractiveComponentByPath(scenarioId, targetPath) {
  const text = `${scenarioId} ${targetPath}`.toLowerCase();
  return INTERACTION_KEYWORDS.some((keyword) => text.includes(keyword));
}

function requiresBehaviorConfirmation(context, targetPath, targetExists) {
  if (targetExists) {
    return false;
  }

  const intentKind = context.resolvedIntent?.componentKind || 'unknown';
  if (INTERACTION_COMPONENT_KINDS.has(intentKind)) {
    return true;
  }

  return isLikelyInteractiveComponentByPath(context.scenario.id, targetPath);
}

function createPlan({
  source,
  action,
  targetPath,
  targetExists,
  storyPath,
  rationale,
  requiresBehaviorConfirmation,
  behaviorQuestions,
}) {
  return {
    source,
    action,
    targetPath,
    targetExists,
    storyPath: storyPath || null,
    rationale: rationale || '',
    requiresBehaviorConfirmation: Boolean(requiresBehaviorConfirmation),
    behaviorQuestions: Array.isArray(behaviorQuestions)
      ? behaviorQuestions.filter(Boolean)
      : [],
  };
}

function buildResolvePrompt(context, contracts) {
  const designContextPath = context.designContextArtifactPath
    ? relative(context.rootPath, context.designContextArtifactPath)
    : '(missing)';
  const designTokenPath = context.designTokensArtifactPath
    ? relative(context.rootPath, context.designTokensArtifactPath)
    : '(missing)';
  const uiRuleSources = contracts.sources?.length
    ? contracts.sources.join(', ')
    : '(none)';
  const feedbackNotes = Array.isArray(context.feedbackLoop?.plan)
    ? context.feedbackLoop.plan.filter(Boolean)
    : [];
  const feedbackSection =
    feedbackNotes.length > 0
      ? [
          '',
          'Retry feedback (apply strictly):',
          ...feedbackNotes.map((note, index) => `- [${index + 1}] ${note}`),
        ]
      : [];

  return [
    'You are planning a UI component implementation in read-only mode.',
    `Scenario id: ${context.scenario.id}`,
    `Brief: ${context.scenario.intent.brief}`,
    `Figma URL: ${context.scenario.figma.url}`,
    `Scope node-id: ${context.figmaScope.selectedNodeId}`,
    `Intent page: ${context.resolvedIntent?.page || '(unknown)'}`,
    `Intent component kind: ${context.resolvedIntent?.componentKind || '(unknown)'}`,
    `Intent role: ${context.resolvedIntent?.role || '(unknown)'}`,
    `Intent state: ${context.resolvedIntent?.state || '(unknown)'}`,
    `Intent confidence: ${Number(context.resolvedIntent?.confidence || 0).toFixed(2)}`,
    context.resolvedIntent?.summary
      ? `Intent summary: ${context.resolvedIntent.summary}`
      : 'Intent summary: (none)',
    `Design context artifact: ${designContextPath}`,
    `Design token artifact: ${designTokenPath}`,
    `UI rule docs: ${uiRuleSources}`,
    '',
    'Rules:',
    '- Prefer reusing/updating existing components and story files.',
    '- Choose target path inside src/shared/components when possible.',
    '- If no similar component exists and behavior definition is required (overlay/menu/form-control-like), set requiresBehaviorConfirmation=true.',
    '- rationale and behaviorQuestions must be written in Korean.',
    '- Do not edit files.',
    '- Return JSON only.',
    ...feedbackSection,
  ].join('\n');
}

function invokeResolveAgent(context, contracts) {
  const schema = {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['update', 'create'],
      },
      targetPath: { type: 'string' },
      storyPath: { type: 'string' },
      rationale: { type: 'string' },
      requiresBehaviorConfirmation: { type: 'boolean' },
      behaviorQuestions: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: [
      'action',
      'targetPath',
      'storyPath',
      'rationale',
      'requiresBehaviorConfirmation',
      'behaviorQuestions',
    ],
    additionalProperties: false,
  };

  return invokeAgentWithSchema(
    context,
    'resolve-component-plan',
    buildResolvePrompt(context, contracts),
    schema,
    Math.min(context.scenario.figma.timeoutMs, 300_000)
  );
}

function enforceBehaviorGate(context, componentPlan) {
  if (
    componentPlan.action !== 'create' ||
    !componentPlan.requiresBehaviorConfirmation
  ) {
    return;
  }

  if (!context.scenario.behavior.confirmed) {
    const questionText =
      componentPlan.behaviorQuestions.length > 0
        ? ` Open questions: ${componentPlan.behaviorQuestions.join(' | ')}`
        : '';
    fail(
      `신규 인터랙션 컴포넌트의 동작 정의 확인이 필요합니다. scenario.behavior.confirmed=true 및 behavior.spec를 지정해 주세요.${questionText}`
    );
  }

  if (!context.scenario.behavior.spec.trim()) {
    fail(
      'scenario.behavior.confirmed=true 이지만 behavior.spec가 비어 있습니다. 구현 전에 명시적 동작 정의를 추가해 주세요.'
    );
  }
}

export function stepResolveComponent(context) {
  if (context.options.dryRun) {
    return {
      skipped: true,
      reason: '--dry-run option',
    };
  }

  const contracts = readContracts(context.rootPath);
  context.contracts = contracts;
  const planFromAgent = invokeResolveAgent(context, contracts);
  const normalizedTargetPath = normalizePath(planFromAgent.targetPath);
  if (!normalizedTargetPath) {
    fail(
      'resolve-component-plan 에이전트가 비어 있는 targetPath를 반환했습니다.'
    );
  }
  const targetExists = existsSync(
    resolve(context.rootPath, normalizedTargetPath)
  );
  const componentPlan = createPlan({
    source: 'agent-plan',
    action: targetExists ? 'update' : String(planFromAgent.action).trim(),
    targetPath: normalizedTargetPath,
    targetExists,
    storyPath: normalizePath(planFromAgent.storyPath || ''),
    rationale: String(planFromAgent.rationale || ''),
    requiresBehaviorConfirmation:
      Boolean(planFromAgent.requiresBehaviorConfirmation) ||
      requiresBehaviorConfirmation(context, normalizedTargetPath, targetExists),
    behaviorQuestions: planFromAgent.behaviorQuestions,
  });

  if (!['update', 'create'].includes(componentPlan.action)) {
    fail(
      `resolve-component-plan이 잘못된 action을 반환했습니다: ${componentPlan.action}`
    );
  }

  if (!componentPlan.targetPath.startsWith('src/')) {
    fail(`targetPath는 src/ 하위여야 합니다: ${componentPlan.targetPath}.`);
  }

  if (componentPlan.action === 'update' && !componentPlan.targetExists) {
    fail(
      `update 대상으로 계획된 파일이 존재하지 않습니다: ${componentPlan.targetPath}.`
    );
  }

  enforceBehaviorGate(context, componentPlan);

  context.componentPlan = componentPlan;
  return context.componentPlan;
}
