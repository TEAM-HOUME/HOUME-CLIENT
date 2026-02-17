import { fail } from '../lib/errors.mjs';

const INTERACTION_COMPONENT_KINDS = new Set([
  'modal',
  'bottom_sheet',
  'dialog',
  'sheet',
  'drawer',
]);

const DEFAULTABLE_COMPONENT_KINDS = new Set([
  'toast',
  'snackbar',
  'banner',
  'chip',
]);

const DEFAULTABLE_AMBIGUITY_CATEGORIES = new Set([
  'placement',
  'dismiss',
  'concurrency',
  'accessibility',
]);

function classifyAmbiguityCategory(ambiguity) {
  const text = String(ambiguity ?? '').toLowerCase();
  if (
    /(trigger|event source|event hook|optimistic|api success|server-confirmed|트리거|시점)/.test(
      text
    )
  ) {
    return 'trigger';
  }
  if (
    /(placement|safe-area|offset|bottom|top|keyboard|배치|하단|상단|세이프에어리어)/.test(
      text
    )
  ) {
    return 'placement';
  }
  if (
    /(dismiss|auto-hide|auto dismiss|manual close|swipe|outside tap|닫힘|닫기)/.test(
      text
    )
  ) {
    return 'dismiss';
  }
  if (
    /(cta|route|navigation|deep-link|target|보러가기|이동 대상|위시리스트)/.test(
      text
    )
  ) {
    return 'cta';
  }
  if (/(concurrency|queue|stack|replace|중복|연속)/.test(text)) {
    return 'concurrency';
  }
  if (
    /(accessibility|aria|screen-reader|focus handling|keyboard interaction|접근성)/.test(
      text
    )
  ) {
    return 'accessibility';
  }
  return 'unknown';
}

function hasIntentOverride(context, category) {
  const overrides =
    context.intentOverrides &&
    typeof context.intentOverrides === 'object' &&
    !Array.isArray(context.intentOverrides)
      ? context.intentOverrides
      : {};

  if (category === 'trigger') {
    return Boolean(overrides.trigger_policy);
  }
  if (category === 'placement') {
    return Boolean(overrides.placement_policy);
  }
  if (category === 'dismiss') {
    return Boolean(overrides.dismiss_policy);
  }
  if (category === 'cta') {
    return Boolean(overrides.cta_target);
  }
  if (category === 'concurrency') {
    return Boolean(overrides.concurrency_policy);
  }
  if (category === 'accessibility') {
    return Boolean(overrides.accessibility_policy);
  }
  return false;
}

function splitAmbiguities(context, intent) {
  const blockingAmbiguities = [];
  const advisoryAmbiguities = [];

  for (const ambiguity of intent.ambiguities) {
    const category = classifyAmbiguityCategory(ambiguity);
    const hasOverride = hasIntentOverride(context, category);
    const defaultableByKind =
      DEFAULTABLE_COMPONENT_KINDS.has(intent.componentKind) &&
      DEFAULTABLE_AMBIGUITY_CATEGORIES.has(category);

    if (hasOverride || defaultableByKind) {
      advisoryAmbiguities.push(ambiguity);
      continue;
    }
    blockingAmbiguities.push(ambiguity);
  }

  return {
    blockingAmbiguities,
    advisoryAmbiguities,
  };
}

function pushWarning(context, message) {
  context.warnings.push(message);
}

function finalizeFailureOrWarning(context, blockingIssues) {
  if (blockingIssues.length === 0) {
    return;
  }
  const joined = blockingIssues.join(' | ');
  if (context.scenario.gates.intentMode === 'error') {
    fail(joined);
  }
  pushWarning(context, joined);
}

export function stepGateIntent(context) {
  if (context.options.dryRun) {
    return {
      skipped: true,
      reason: '--dry-run option',
    };
  }

  const intent = context.resolvedIntent;
  if (!intent) {
    const message = 'Resolved intent is missing in context.';
    if (context.scenario.gates.intentMode === 'error') {
      fail(message);
    }
    pushWarning(context, message);
    context.intentGate = {
      mode: context.scenario.gates.intentMode,
      status: 'missing',
      confidence: 0,
      minConfidence: context.scenario.gates.intentMinConfidence,
      missingFields: ['all'],
      ambiguities: [],
      blockingAmbiguities: [],
      advisoryAmbiguities: [],
    };
    return context.intentGate;
  }

  const blockingIssues = [];

  const missingFields = [];
  if (!intent.page) {
    missingFields.push('page');
  }
  if (!intent.componentKind) {
    missingFields.push('componentKind');
  }
  if (!intent.role) {
    missingFields.push('role');
  }
  if (!intent.state) {
    missingFields.push('state');
  }

  if (missingFields.length > 0) {
    blockingIssues.push(
      `Intent fields are missing: ${missingFields.join(', ')}`
    );
  }

  if (intent.componentKind === 'unknown') {
    blockingIssues.push(
      'Intent componentKind is unknown. Clarify the component role in brief/intent hints.'
    );
  }

  if (intent.confidence < context.scenario.gates.intentMinConfidence) {
    blockingIssues.push(
      `Intent confidence is low (${intent.confidence.toFixed(2)} < ${context.scenario.gates.intentMinConfidence.toFixed(2)}).`
    );
  }

  const { blockingAmbiguities, advisoryAmbiguities } = splitAmbiguities(
    context,
    intent
  );
  if (blockingAmbiguities.length > 0) {
    blockingIssues.push(
      `Intent ambiguities require clarification: ${blockingAmbiguities.join(' | ')}`
    );
  }
  if (advisoryAmbiguities.length > 0) {
    pushWarning(
      context,
      `Intent advisory ambiguities auto-resolved by profile/override: ${advisoryAmbiguities.join(' | ')}`
    );
  }

  const requiresBehaviorConfirmation =
    intent.behaviorNeeded &&
    INTERACTION_COMPONENT_KINDS.has(intent.componentKind) &&
    !context.scenario.behavior.confirmed;
  if (requiresBehaviorConfirmation) {
    blockingIssues.push(
      `New interaction behavior requires confirmation. Set behavior.confirmed=true and provide behavior.spec. componentKind=${intent.componentKind}`
    );
  }

  const missingBehaviorSpec =
    intent.behaviorNeeded &&
    INTERACTION_COMPONENT_KINDS.has(intent.componentKind) &&
    context.scenario.behavior.confirmed &&
    !context.scenario.behavior.spec.trim();
  if (missingBehaviorSpec) {
    blockingIssues.push(
      `behavior.confirmed=true but behavior.spec is empty. Provide behavior spec for interactive component (${intent.componentKind}).`
    );
  }

  context.intentGate = {
    mode: context.scenario.gates.intentMode,
    status:
      blockingIssues.length === 0
        ? advisoryAmbiguities.length === 0
          ? 'ok'
          : 'ok_with_advisory'
        : 'degraded',
    confidence: intent.confidence,
    minConfidence: context.scenario.gates.intentMinConfidence,
    missingFields,
    ambiguities: intent.ambiguities,
    blockingAmbiguities,
    advisoryAmbiguities,
    requiresBehaviorConfirmation,
    missingBehaviorSpec,
  };

  finalizeFailureOrWarning(context, blockingIssues);
  return context.intentGate;
}
