import { fail } from '../lib/errors.mjs';

const INTERACTION_COMPONENT_KINDS = new Set([
  'modal',
  'bottom_sheet',
  'dialog',
  'sheet',
  'drawer',
]);

function splitAmbiguities(intent) {
  const blockingAmbiguities = [];
  const advisoryAmbiguities = [];

  for (const ambiguity of intent.ambiguities) {
    const text = String(ambiguity ?? '').toLowerCase();
    const isToolingMetaAmbiguity =
      /(code connect|would you like to connect code components|connect code components|mcp auth|mcp token|access token|tool availability|도구 연결|코드 커넥트)/.test(
        text
      );
    if (isToolingMetaAmbiguity) {
      advisoryAmbiguities.push(ambiguity);
      continue;
    }
    blockingAmbiguities.push(ambiguity);
  }

  return {
    blockingAmbiguities,
    advisoryAmbiguities,
    blockingCategories: [],
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
    const message = '해석된 intent가 컨텍스트에 없습니다.';
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
      `Intent 필드가 누락되었습니다: ${missingFields.join(', ')}`
    );
  }

  if (intent.componentKind === 'unknown') {
    blockingIssues.push(
      'Intent componentKind가 unknown입니다. brief/intent 힌트로 컴포넌트 역할을 명확히 지정해 주세요.'
    );
  }

  if (intent.confidence < context.scenario.gates.intentMinConfidence) {
    blockingIssues.push(
      `Intent 신뢰도가 낮습니다 (${intent.confidence.toFixed(2)} < ${context.scenario.gates.intentMinConfidence.toFixed(2)}).`
    );
  }

  const { blockingAmbiguities, advisoryAmbiguities, blockingCategories } =
    splitAmbiguities(intent);
  if (blockingAmbiguities.length > 0) {
    blockingIssues.push(
      `Intent 모호점 확인이 필요합니다: ${blockingAmbiguities.join(' | ')}`
    );
  }
  if (advisoryAmbiguities.length > 0) {
    pushWarning(
      context,
      `Intent 권고 모호점(도구/연동 메타)은 구현 블로킹에서 제외되었습니다: ${advisoryAmbiguities.join(' | ')}`
    );
  }

  const requiresBehaviorConfirmation =
    intent.behaviorNeeded &&
    INTERACTION_COMPONENT_KINDS.has(intent.componentKind) &&
    !context.scenario.behavior.confirmed;
  if (requiresBehaviorConfirmation) {
    blockingIssues.push(
      `신규 인터랙션 동작 정의 확인이 필요합니다. behavior.confirmed=true 및 behavior.spec를 지정해 주세요. componentKind=${intent.componentKind}`
    );
  }

  const missingBehaviorSpec =
    intent.behaviorNeeded &&
    INTERACTION_COMPONENT_KINDS.has(intent.componentKind) &&
    context.scenario.behavior.confirmed &&
    !context.scenario.behavior.spec.trim();
  if (missingBehaviorSpec) {
    blockingIssues.push(
      `behavior.confirmed=true 이지만 behavior.spec가 비어 있습니다. 인터랙션 컴포넌트(${intent.componentKind}) 동작 정의를 입력해 주세요.`
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
    blockingCategories,
    requiresBehaviorConfirmation,
    missingBehaviorSpec,
  };

  finalizeFailureOrWarning(context, blockingIssues);
  return context.intentGate;
}
