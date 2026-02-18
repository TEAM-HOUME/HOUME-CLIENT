import { fail } from '../lib/errors.mjs';
import {
  buildBehaviorConfirmationRequiredMessage,
  buildBehaviorSpecMissingMessage,
  readBehaviorConfig,
} from '../lib/behavior-guidance.mjs';
import { INTERACTION_COMPONENT_KINDS } from '../lib/intent-taxonomy.mjs';

function isToolingMetaAmbiguity(text) {
  return /(code connect|would you like to connect code components|connect code components|mcp auth|mcp token|access token|tool availability|도구 연결|코드 커넥트)/.test(
    text
  );
}

function isDeferredFigmaAmbiguity(text) {
  const hasFigmaOrDesignSignal =
    /(figma|피그마|node-id|노드[\s-]*id|노드\s*수치|노드\s*기준|디자인\s*수치|디자인\s*값|px|치수|여백|padding|margin|spacing|버튼\s*위치|오버레이|overlay|opacity|투명도|강도|에셋|asset|파일\s*경로|포맷|해상도|svg|png|jpg|jpeg)/.test(
      text
    );
  const hasAssetMappingSignal =
    /(에셋\s*매핑|asset\s*mapping|파일\s*매핑|경로\s*매핑)/.test(text);
  const hasDeferredSignal =
    /(후속\s*단계|다음\s*단계|추후|최종\s*확정|확정\s*필요|확인\s*필요|기준으로\s*확정|기준으로\s*결정)/.test(
      text
    );

  if (hasAssetMappingSignal) {
    return true;
  }
  if (hasFigmaOrDesignSignal && hasDeferredSignal) {
    return true;
  }
  if (
    /(cta\s*텍스트|타이포|text\s*label)/.test(text) &&
    /(figma|피그마)/.test(text)
  ) {
    return true;
  }
  return false;
}

function splitAmbiguities(intent) {
  const blockingAmbiguities = [];
  const advisoryAmbiguities = [];
  const deferredAmbiguities = [];
  const blockingCategories = [];
  const advisoryCategories = [];

  for (const ambiguity of intent.ambiguities) {
    const text = String(ambiguity ?? '').toLowerCase();
    if (isToolingMetaAmbiguity(text)) {
      advisoryAmbiguities.push(ambiguity);
      advisoryCategories.push('tooling_meta');
      continue;
    }
    if (isDeferredFigmaAmbiguity(text)) {
      advisoryAmbiguities.push(ambiguity);
      deferredAmbiguities.push(ambiguity);
      advisoryCategories.push('deferred_figma');
      continue;
    }
    blockingAmbiguities.push(ambiguity);
    blockingCategories.push('unresolved_intent');
  }

  return {
    blockingAmbiguities,
    advisoryAmbiguities,
    deferredAmbiguities,
    blockingCategories,
    advisoryCategories,
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
      deferredAmbiguities: [],
      blockingCategories: [],
      advisoryCategories: [],
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

  const {
    blockingAmbiguities,
    advisoryAmbiguities,
    deferredAmbiguities,
    blockingCategories,
    advisoryCategories,
  } = splitAmbiguities(intent);
  if (blockingAmbiguities.length > 0) {
    blockingIssues.push(
      `Intent 모호점 확인이 필요합니다: ${blockingAmbiguities.join(' | ')}`
    );
  }
  if (advisoryAmbiguities.length > 0) {
    const categories = [...new Set(advisoryCategories)];
    const categoryLabel =
      categories.length > 0 ? categories.join(', ') : 'advisory';
    pushWarning(
      context,
      `Intent 권고 모호점(${categoryLabel}): ${advisoryAmbiguities.join(' | ')}`
    );
  }
  if (deferredAmbiguities.length > 0) {
    pushWarning(
      context,
      `후속 Figma 단계에서 확인할 모호점으로 이관되었습니다: ${deferredAmbiguities.join(' | ')}`
    );
  }

  const behaviorConfig = readBehaviorConfig(context.scenario);
  const requiresBehaviorConfirmation =
    intent.behaviorNeeded &&
    INTERACTION_COMPONENT_KINDS.has(intent.componentKind) &&
    !behaviorConfig.confirmed;
  if (requiresBehaviorConfirmation) {
    blockingIssues.push(
      buildBehaviorConfirmationRequiredMessage({
        componentKind: intent.componentKind,
        intentSummary: intent.summary,
      })
    );
  }

  const missingBehaviorSpec =
    intent.behaviorNeeded &&
    INTERACTION_COMPONENT_KINDS.has(intent.componentKind) &&
    behaviorConfig.confirmed &&
    !behaviorConfig.spec;
  if (missingBehaviorSpec) {
    blockingIssues.push(
      buildBehaviorSpecMissingMessage({
        componentKind: intent.componentKind,
        intentSummary: intent.summary,
      })
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
    deferredAmbiguities,
    blockingCategories,
    advisoryCategories,
    requiresBehaviorConfirmation,
    missingBehaviorSpec,
  };

  finalizeFailureOrWarning(context, blockingIssues);
  return context.intentGate;
}
