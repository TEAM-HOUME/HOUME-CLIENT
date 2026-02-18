import { splitErrorDetails } from '../step-utils.mjs';
import { STAGE_LABELS } from './constants.mjs';
import { createPromptInterface, askLine } from './prompt-io.mjs';
import {
  buildAssetOverrideFeedback,
  buildIntentOverrideFeedback,
  collectAssetStructuredOverrides,
  collectIntentStructuredOverrides,
  mergeAssetOverrides,
  mergeIntentOverrides,
  printAssetOverrideSummary,
  printIntentOverrideSummary,
} from './overrides.mjs';

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
