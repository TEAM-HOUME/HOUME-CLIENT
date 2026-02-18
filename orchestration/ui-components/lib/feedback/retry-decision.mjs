import { splitErrorDetails } from '../step-utils.mjs';
import { STAGE_LABELS } from './constants.mjs';
import { askLine, createPromptInterface } from './prompt-io.mjs';

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
  const noteQuestion = '추가 프롬프트 입력 (선택, Enter=생략): ';
  const parsedError = splitErrorDetails(errorMessage);
  console.log(
    `[ui-components] [${stage}] ${stageLabel} 단계 실패 (${attempt}/${maxAttempts})`
  );
  if (parsedError.summary) {
    console.log(`- 사유: ${parsedError.summary}`);
  }
  if (parsedError.details.length > 0) {
    if (stage === 'intent') {
      console.log('  - 상세: 직전 [gate-intent] 블록 참고');
    } else {
      parsedError.details.forEach((detail, index) => {
        console.log(`  - 상세 ${index + 1}: ${detail}`);
      });
    }
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
        },
        retry: false,
        inputSource: source,
      });
      return {
        retry: false,
        note: '',
      };
    }

    const note = String((await askLine(rl, noteQuestion)) ?? '').trim();
    const questions = [retryQuestion];
    const answers = {
      retryAnswerRaw: parsedDecision.raw,
      note,
    };

    questions.push(noteQuestion);

    recordFeedbackHistory(context, {
      stage,
      attempt,
      maxAttempts,
      timestamp: new Date().toISOString(),
      errorMessage,
      questions,
      answers,
      retry: true,
      inputSource: source,
    });
    return {
      retry: true,
      note,
    };
  } finally {
    rl.close();
    dispose();
  }
}
