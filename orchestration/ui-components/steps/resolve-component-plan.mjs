import { existsSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { invokeAgentWithSchema } from '../lib/agent.mjs';
import { inferTargetFromScenario, readContracts } from '../lib/contracts.mjs';
import { fail } from '../lib/errors.mjs';

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
  'select',
  'accordion',
];

function normalizePath(value) {
  return String(value ?? '')
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\.\//, '');
}

function isLikelyInteractiveComponent(scenarioId, targetPath) {
  const text = `${scenarioId} ${targetPath}`.toLowerCase();
  return INTERACTION_KEYWORDS.some((keyword) => text.includes(keyword));
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

  return [
    'You are planning a UI component implementation in read-only mode.',
    `Scenario id: ${context.scenario.id}`,
    `Figma URL: ${context.scenario.figma.url}`,
    `Scope node-id: ${context.figmaScope.selectedNodeId}`,
    `Design context artifact: ${designContextPath}`,
    `Design token artifact: ${designTokenPath}`,
    `UI rule docs: ${uiRuleSources}`,
    '',
    'Rules:',
    '- Prefer reusing/updating existing components and story files.',
    '- Choose target path inside src/shared/components when possible.',
    '- If no similar component exists and behavior definition is required (modal/sheet/dialog-like), set requiresBehaviorConfirmation=true.',
    '- Do not edit files.',
    '- Return JSON only.',
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
    Math.min(context.scenario.figma.timeoutMs, 300_000),
    {
      claudePermissionMode: 'plan',
    }
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
      `Behavior definition required for new interactive component. Confirm in scenario.behavior.confirmed=true and provide behavior.spec.${questionText}`
    );
  }

  if (!context.scenario.behavior.spec.trim()) {
    fail(
      'scenario.behavior.confirmed=true but behavior.spec is empty. Add explicit behavior spec before implementation.'
    );
  }
}

export function stepResolveComponent(context) {
  const contracts = readContracts(context.rootPath, context.scenario);
  context.contracts = contracts;
  let componentPlan = null;

  if (context.scenario.targets.length === 1) {
    const onlyTarget = context.scenario.targets[0];
    const targetExists = existsSync(resolve(context.rootPath, onlyTarget));
    componentPlan = createPlan({
      source: 'scenario',
      action: targetExists ? 'update' : 'create',
      targetPath: onlyTarget,
      targetExists,
      storyPath: null,
      rationale: 'single explicit target from scenario',
      requiresBehaviorConfirmation:
        !targetExists &&
        isLikelyInteractiveComponent(context.scenario.id, onlyTarget),
      behaviorQuestions: [],
    });
  } else if (context.scenario.targets.length > 1) {
    fail(
      `Multiple targets are not supported in automatic planning. Keep one target only. targets=${context.scenario.targets.join(', ')}`
    );
  }

  if (!componentPlan) {
    const inferredTarget = inferTargetFromScenario(
      context.rootPath,
      context.scenario.id
    );
    if (inferredTarget) {
      const targetExists = existsSync(
        resolve(context.rootPath, inferredTarget)
      );
      componentPlan = createPlan({
        source: 'inferred',
        action: targetExists ? 'update' : 'create',
        targetPath: inferredTarget,
        targetExists,
        storyPath: null,
        rationale: 'path inferred from scenario id tokens',
        requiresBehaviorConfirmation:
          !targetExists &&
          isLikelyInteractiveComponent(context.scenario.id, inferredTarget),
        behaviorQuestions: [],
      });
    }
  }

  if (!componentPlan) {
    const planFromAgent = invokeResolveAgent(context, contracts);
    const normalizedTargetPath = normalizePath(planFromAgent.targetPath);
    if (!normalizedTargetPath) {
      fail('resolve-component-plan agent returned empty targetPath.');
    }
    const targetExists = existsSync(
      resolve(context.rootPath, normalizedTargetPath)
    );
    componentPlan = createPlan({
      source: 'agent-plan',
      action: targetExists ? 'update' : String(planFromAgent.action).trim(),
      targetPath: normalizedTargetPath,
      targetExists,
      storyPath: normalizePath(planFromAgent.storyPath || ''),
      rationale: String(planFromAgent.rationale || ''),
      requiresBehaviorConfirmation:
        Boolean(planFromAgent.requiresBehaviorConfirmation) ||
        (!targetExists &&
          isLikelyInteractiveComponent(
            context.scenario.id,
            normalizedTargetPath
          )),
      behaviorQuestions: planFromAgent.behaviorQuestions,
    });
  }

  if (!['update', 'create'].includes(componentPlan.action)) {
    fail(
      `resolve-component-plan returned invalid action: ${componentPlan.action}`
    );
  }

  if (!componentPlan.targetPath.startsWith('src/')) {
    fail(
      `Target path must be under src/: ${componentPlan.targetPath}. Add explicit scenario.target if needed.`
    );
  }

  if (componentPlan.action === 'update' && !componentPlan.targetExists) {
    fail(
      `Planned update target does not exist: ${componentPlan.targetPath}. Set scenario.target to existing file or create plan.`
    );
  }

  enforceBehaviorGate(context, componentPlan);

  context.componentPlan = componentPlan;
  return context.componentPlan;
}
