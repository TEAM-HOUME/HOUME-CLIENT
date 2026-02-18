import { promptRetryDecision } from './retry-decision.mjs';
import { appendFeedback } from './store.mjs';
import {
  buildBehaviorRetryHintForConfirmation,
  buildBehaviorRetryHintForMissingSpec,
} from '../behavior-guidance.mjs';

function toErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function includesBehaviorPromptSignal(text) {
  const normalized = String(text ?? '').toLowerCase();
  return (
    normalized.includes('세부 동작 명세') ||
    normalized.includes('동작 상세 설명') ||
    normalized.includes('동작 확정')
  );
}

function shouldApplyBehaviorSpec(context, stage, errorMessage) {
  if (stage === 'intent') {
    const gate = context.intentGate || {};
    return Boolean(
      gate.requiresBehaviorConfirmation || gate.missingBehaviorSpec
    );
  }
  if (stage === 'plan') {
    return includesBehaviorPromptSignal(errorMessage);
  }
  return false;
}

function applyRuntimeBehaviorSpec(context, stage, decision, errorMessage) {
  if (!shouldApplyBehaviorSpec(context, stage, errorMessage)) {
    return false;
  }

  const behaviorSpec = String(decision?.note ?? '').trim();
  if (!behaviorSpec) {
    return false;
  }

  if (
    !context.scenario.behavior ||
    typeof context.scenario.behavior !== 'object'
  ) {
    context.scenario.behavior = {
      confirmed: true,
      spec: behaviorSpec,
    };
  } else {
    context.scenario.behavior.confirmed = true;
    context.scenario.behavior.spec = behaviorSpec;
  }

  appendFeedback(
    context,
    stage,
    `세부 동작 명세(추가 프롬프트 반영): ${behaviorSpec}`
  );
  return true;
}

function buildIntentRetryHints(context, errorMessage) {
  const gate = context.intentGate || {};
  const lines = [];

  if (Array.isArray(gate.blockingAmbiguities)) {
    gate.blockingAmbiguities.slice(0, 5).forEach((item) => {
      const text = String(item ?? '').trim();
      if (text) {
        lines.push(text);
      }
    });
  }

  if (gate.requiresBehaviorConfirmation) {
    lines.push(
      buildBehaviorRetryHintForConfirmation({
        componentKind: context.resolvedIntent?.componentKind,
      })
    );
  }

  if (gate.missingBehaviorSpec) {
    lines.push(
      buildBehaviorRetryHintForMissingSpec({
        componentKind: context.resolvedIntent?.componentKind,
      })
    );
  }

  if (lines.length === 0) {
    lines.push(`직전 실패 요약: ${errorMessage}`);
  }

  return [
    '직전 intent 단계 보강 포인트',
    ...lines.map((line, index) => `${index + 1}. ${line}`),
  ].join('\n');
}

export async function runPlanWithFeedbackLoop(context, options) {
  const { retryLimits, runStep, stepResolveComponent } = options;

  for (let attempt = 1; attempt <= retryLimits.plan; attempt += 1) {
    try {
      runStep(context, 'resolve-component-plan', stepResolveComponent);
      return;
    } catch (error) {
      const errorMessage = toErrorMessage(error);
      if (attempt >= retryLimits.plan) {
        throw error;
      }

      const decision = await promptRetryDecision(
        context,
        'plan',
        attempt,
        retryLimits.plan,
        errorMessage
      );
      if (!decision.retry) {
        throw error;
      }
      const appliedBehaviorSpec = applyRuntimeBehaviorSpec(
        context,
        'plan',
        decision,
        errorMessage
      );
      if (decision.note && !appliedBehaviorSpec) {
        appendFeedback(context, 'plan', decision.note);
      }
      if (!decision.note && !appliedBehaviorSpec) {
        appendFeedback(
          context,
          'plan',
          `Previous plan failure: ${errorMessage}`
        );
      }
    }
  }
}

export async function runAssetCoverageWithFeedbackLoop(context, options) {
  const {
    retryLimits,
    runStep,
    stepExtractFigmaAssetScope,
    stepGateAssetCoverage,
  } = options;

  for (let attempt = 1; attempt <= retryLimits.asset; attempt += 1) {
    try {
      runStep(context, 'extract-figma-asset-scope', stepExtractFigmaAssetScope);
      runStep(context, 'gate-figma-asset-coverage', stepGateAssetCoverage);
      return;
    } catch (error) {
      const errorMessage = toErrorMessage(error);
      if (attempt >= retryLimits.asset) {
        throw error;
      }

      const decision = await promptRetryDecision(
        context,
        'asset',
        attempt,
        retryLimits.asset,
        errorMessage
      );
      if (!decision.retry) {
        throw error;
      }

      appendFeedback(
        context,
        'asset',
        decision.note || `Previous asset coverage failure: ${errorMessage}`
      );
    }
  }
}

export async function runIntentWithFeedbackLoop(context, options) {
  const { retryLimits, runStep, stepExtractIntent, stepGateIntent } = options;

  for (let attempt = 1; attempt <= retryLimits.intent; attempt += 1) {
    try {
      runStep(context, 'extract-intent', stepExtractIntent);
      runStep(context, 'gate-intent', stepGateIntent);
      return;
    } catch (error) {
      const errorMessage = toErrorMessage(error);
      if (attempt >= retryLimits.intent) {
        throw error;
      }

      const decision = await promptRetryDecision(
        context,
        'intent',
        attempt,
        retryLimits.intent,
        errorMessage
      );
      if (!decision.retry) {
        throw error;
      }
      const appliedBehaviorSpec = applyRuntimeBehaviorSpec(
        context,
        'intent',
        decision,
        errorMessage
      );

      appendFeedback(
        context,
        'intent',
        buildIntentRetryHints(context, errorMessage)
      );
      if (decision.note && !appliedBehaviorSpec) {
        appendFeedback(context, 'intent', decision.note);
      }
    }
  }
}

export async function runImplementationWithFeedbackLoop(context, options) {
  const {
    retryLimits,
    runStep,
    stepRunAgent,
    stepGateChangedPaths,
    stepVerify,
  } = options;

  let verifyAttempt = 0;

  for (
    let implementAttempt = 1;
    implementAttempt <= retryLimits.implement;
    implementAttempt += 1
  ) {
    try {
      runStep(context, 'run-agent-implementation', stepRunAgent);
      runStep(context, 'gate-changed-paths', stepGateChangedPaths);
    } catch (error) {
      const errorMessage = toErrorMessage(error);
      if (implementAttempt >= retryLimits.implement) {
        throw error;
      }

      const decision = await promptRetryDecision(
        context,
        'implement',
        implementAttempt,
        retryLimits.implement,
        errorMessage
      );
      if (!decision.retry) {
        throw error;
      }
      appendFeedback(
        context,
        'implement',
        decision.note || `Previous implement/path-gate failure: ${errorMessage}`
      );
      continue;
    }

    if (context.options.skipVerify) {
      runStep(context, 'verify', () => {
        return {
          skipped: true,
          reason: '--skip-verify option',
        };
      });
      return;
    }

    try {
      runStep(context, 'verify', stepVerify);
      return;
    } catch (error) {
      verifyAttempt += 1;
      const errorMessage = toErrorMessage(error);
      if (verifyAttempt >= retryLimits.verify) {
        throw error;
      }

      const decision = await promptRetryDecision(
        context,
        'verify',
        verifyAttempt,
        retryLimits.verify,
        errorMessage
      );
      if (!decision.retry) {
        throw error;
      }

      appendFeedback(
        context,
        'verify',
        decision.note || `Previous verify failure: ${errorMessage}`
      );
      appendFeedback(
        context,
        'implement',
        `Fix verify failure before next validation: ${errorMessage}`
      );
      if (decision.note) {
        appendFeedback(context, 'implement', decision.note);
      }
    }
  }

  throw new Error(
    `Implementation retry limit exceeded (${retryLimits.implement}).`
  );
}
