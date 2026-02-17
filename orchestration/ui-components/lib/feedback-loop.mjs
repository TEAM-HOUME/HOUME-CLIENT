import { splitErrorDetails } from './step-utils.mjs';
import {
  MAX_FEEDBACK_NOTES_PER_STAGE,
  STAGE_LABELS,
} from './feedback/constants.mjs';
import { createPromptInterface, askLine } from './feedback/prompt-io.mjs';
import {
  buildAssetOverrideFeedback,
  buildIntentOverrideFeedback,
  collectAssetStructuredOverrides,
  collectIntentStructuredOverrides,
  mergeAssetOverrides,
  mergeIntentOverrides,
  printAssetOverrideSummary,
  printIntentOverrideSummary,
} from './feedback/overrides.mjs';

export { DEFAULT_RETRY_LIMITS } from './feedback/constants.mjs';

function parseRetryChoice(rawAnswer) {
  const raw = String(rawAnswer ?? '').trim();
  if (!raw) {
    return { retry: true, raw };
  }

  const lower = raw.toLowerCase();
  if (lower === 'y' || lower === 'yes') {
    return { retry: true, raw };
  }
  if (lower === 'n' || lower === 'no') {
    return { retry: false, raw };
  }
  return null;
}

function recordFeedbackHistory(context, entry) {
  if (!Array.isArray(context.feedbackHistory)) {
    return;
  }
  context.feedbackHistory.push(entry);
}

function applyStructuredOverrides(context, stage, structuredOverrides) {
  if (stage === 'intent') {
    const applied = mergeIntentOverrides(context, structuredOverrides);
    printIntentOverrideSummary(stage, applied);
    return {
      appliedOverrides: applied,
      structuredFeedback: buildIntentOverrideFeedback(applied),
    };
  }

  if (stage === 'asset') {
    const applied = mergeAssetOverrides(context, structuredOverrides);
    printAssetOverrideSummary(stage, applied);
    return {
      appliedOverrides: applied,
      structuredFeedback: buildAssetOverrideFeedback(applied),
    };
  }

  return {
    appliedOverrides: null,
    structuredFeedback: '',
  };
}

async function collectStructuredOverrides(context, rl, stage) {
  const requiredIntentCategories =
    stage === 'intent' && Array.isArray(context.intentGate?.blockingCategories)
      ? context.intentGate.blockingCategories
      : [];

  if (stage === 'intent' && requiredIntentCategories.length > 0) {
    console.log(
      `[ui-components] [${stage}] 현재 블로킹 모호점 카테고리: ${requiredIntentCategories.join(', ')}`
    );
  }

  if (stage === 'intent') {
    return collectIntentStructuredOverrides(
      rl,
      stage,
      requiredIntentCategories
    );
  }
  if (stage === 'asset') {
    return collectAssetStructuredOverrides(rl, stage);
  }
  return {};
}

export async function promptRetryDecision(
  context,
  stage,
  attempt,
  maxAttempts,
  errorMessage
) {
  const stageLabel = STAGE_LABELS[stage] || stage;
  const remaining = Math.max(0, maxAttempts - attempt);
  const retryQuestion = `재시도하시겠습니까? (남은 ${remaining}회, y/n, Enter=y): `;
  const noteQuestion = '자유 보강 지시 입력 (선택, Enter=생략): ';
  const parsedError = splitErrorDetails(errorMessage);
  console.log(
    `[ui-components] [${stage}] ${stageLabel} 단계 실패 (${attempt}/${maxAttempts})`
  );
  if (parsedError.summary) {
    console.log(`- 사유: ${parsedError.summary}`);
  }
  if (parsedError.details.length > 0) {
    parsedError.details.forEach((detail, index) => {
      console.log(`  - 상세 ${index + 1}: ${detail}`);
    });
  }

  const promptInterface = createPromptInterface(stage);
  if (!promptInterface) {
    recordFeedbackHistory(context, {
      stage,
      attempt,
      maxAttempts,
      timestamp: new Date().toISOString(),
      errorMessage,
      questions: [retryQuestion],
      answers: {
        retryAnswerRaw: null,
        note: null,
        structuredOverrides: null,
      },
      retry: false,
      inputSource: 'none',
      reason: 'input_unavailable',
    });
    return {
      retry: false,
      note: '',
    };
  }

  const { rl, dispose, source } = promptInterface;

  try {
    let parsedDecision = null;
    while (!parsedDecision) {
      const retryAnswer = await askLine(rl, retryQuestion);
      parsedDecision = parseRetryChoice(retryAnswer);
      if (!parsedDecision) {
        console.log('입력 형식 오류: y 또는 n으로 입력해 주세요');
      }
    }

    const retry = parsedDecision.retry;
    if (!retry) {
      recordFeedbackHistory(context, {
        stage,
        attempt,
        maxAttempts,
        timestamp: new Date().toISOString(),
        errorMessage,
        questions: [retryQuestion],
        answers: {
          retryAnswerRaw: parsedDecision.raw,
          note: null,
          structuredOverrides: null,
        },
        retry: false,
        inputSource: source,
      });
      return {
        retry: false,
        note: '',
      };
    }

    const structuredOverrides = await collectStructuredOverrides(
      context,
      rl,
      stage
    );
    const { appliedOverrides, structuredFeedback } = applyStructuredOverrides(
      context,
      stage,
      structuredOverrides
    );
    const note = String((await askLine(rl, noteQuestion)) ?? '').trim();
    const mergedNote = [note, structuredFeedback].filter(Boolean).join(' || ');

    recordFeedbackHistory(context, {
      stage,
      attempt,
      maxAttempts,
      timestamp: new Date().toISOString(),
      errorMessage,
      questions: [retryQuestion, noteQuestion],
      answers: {
        retryAnswerRaw: parsedDecision.raw,
        note: mergedNote,
        structuredOverrides: appliedOverrides,
      },
      retry: true,
      inputSource: source,
    });
    return {
      retry: true,
      note: mergedNote,
    };
  } finally {
    rl.close();
    dispose();
  }
}

export function appendFeedback(context, stage, value) {
  if (!value || !context.feedbackLoop?.[stage]) {
    return;
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return;
  }

  const target = context.feedbackLoop[stage];
  if (target.includes(normalized)) {
    return;
  }
  target.push(normalized);
  if (target.length > MAX_FEEDBACK_NOTES_PER_STAGE) {
    target.splice(0, target.length - MAX_FEEDBACK_NOTES_PER_STAGE);
  }
}

export async function runPlanWithFeedbackLoop(context, options) {
  const { retryLimits, runStep, stepResolveComponent } = options;

  for (let attempt = 1; attempt <= retryLimits.plan; attempt += 1) {
    try {
      runStep(context, 'resolve-component-plan', stepResolveComponent);
      return;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
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
      appendFeedback(
        context,
        'plan',
        decision.note || `Previous plan failure: ${errorMessage}`
      );
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
      const errorMessage =
        error instanceof Error ? error.message : String(error);
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
      const errorMessage =
        error instanceof Error ? error.message : String(error);
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

      appendFeedback(
        context,
        'intent',
        decision.note || `Previous intent failure: ${errorMessage}`
      );
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
      const errorMessage =
        error instanceof Error ? error.message : String(error);
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
      const errorMessage =
        error instanceof Error ? error.message : String(error);
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
