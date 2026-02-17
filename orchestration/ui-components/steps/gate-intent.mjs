import { fail } from '../lib/errors.mjs';

const INTERACTION_COMPONENT_KINDS = new Set([
  'modal',
  'bottom_sheet',
  'dialog',
  'sheet',
  'drawer',
]);

function gateFailureOrWarning(context, message) {
  if (context.scenario.gates.intentMode === 'error') {
    fail(message);
  }
  context.warnings.push(message);
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
    gateFailureOrWarning(context, 'Resolved intent is missing in context.');
    context.intentGate = {
      mode: context.scenario.gates.intentMode,
      status: 'missing',
      confidence: 0,
      minConfidence: context.scenario.gates.intentMinConfidence,
      missingFields: ['all'],
      ambiguities: [],
    };
    return context.intentGate;
  }

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
    gateFailureOrWarning(
      context,
      `Intent fields are missing: ${missingFields.join(', ')}`
    );
  }

  if (intent.componentKind === 'unknown') {
    gateFailureOrWarning(
      context,
      'Intent componentKind is unknown. Clarify the component role in brief/intent hints.'
    );
  }

  if (intent.confidence < context.scenario.gates.intentMinConfidence) {
    gateFailureOrWarning(
      context,
      `Intent confidence is low (${intent.confidence.toFixed(2)} < ${context.scenario.gates.intentMinConfidence.toFixed(2)}).`
    );
  }

  if (intent.ambiguities.length > 0) {
    gateFailureOrWarning(
      context,
      `Intent ambiguities require clarification: ${intent.ambiguities.join(' | ')}`
    );
  }

  const requiresBehaviorConfirmation =
    intent.behaviorNeeded &&
    INTERACTION_COMPONENT_KINDS.has(intent.componentKind) &&
    !context.scenario.behavior.confirmed;
  if (requiresBehaviorConfirmation) {
    fail(
      `New interaction behavior requires confirmation. Set behavior.confirmed=true and provide behavior.spec. componentKind=${intent.componentKind}`
    );
  }

  const missingBehaviorSpec =
    intent.behaviorNeeded &&
    INTERACTION_COMPONENT_KINDS.has(intent.componentKind) &&
    context.scenario.behavior.confirmed &&
    !context.scenario.behavior.spec.trim();
  if (missingBehaviorSpec) {
    fail(
      `behavior.confirmed=true but behavior.spec is empty. Provide behavior spec for interactive component (${intent.componentKind}).`
    );
  }

  context.intentGate = {
    mode: context.scenario.gates.intentMode,
    status:
      missingFields.length === 0 &&
      intent.componentKind !== 'unknown' &&
      intent.confidence >= context.scenario.gates.intentMinConfidence &&
      intent.ambiguities.length === 0
        ? 'ok'
        : 'degraded',
    confidence: intent.confidence,
    minConfidence: context.scenario.gates.intentMinConfidence,
    missingFields,
    ambiguities: intent.ambiguities,
    requiresBehaviorConfirmation,
    missingBehaviorSpec,
  };

  return context.intentGate;
}
