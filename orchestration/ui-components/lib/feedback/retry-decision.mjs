import { splitErrorDetails } from '../step-utils.mjs';
import { STAGE_LABELS } from './constants.mjs';
import { collectIntentCodebaseGuidance } from './intent-codebase-guidance.mjs';
import { createPromptInterface, askLine } from './prompt-io.mjs';

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

function parseIntentRetryMode(rawAnswer) {
  const raw = String(rawAnswer ?? '').trim();
  if (!raw || raw === '1') {
    return 'codebase';
  }
  if (raw === '2') {
    return 'manual';
  }
  return null;
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
  const intentModeQuestion =
    '재시도 방식 선택 (Enter=1): 1) 코드베이스 기준 적용 2) 직접 보강 입력: ';
  const parsedError = splitErrorDetails(errorMessage);
  const intentGuidance =
    stage === 'intent' ? collectIntentCodebaseGuidance(context) : null;
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
  if (stage === 'intent' && intentGuidance) {
    console.log('[ui-components] [intent] 코드베이스 참고 정보');
    intentGuidance.summaryLines.forEach((line) => {
      console.log(`  ${line}`);
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

    let note = '';
    let retryMode = 'manual';
    const questions = [retryQuestion];
    const answers = {
      retryAnswerRaw: parsedDecision.raw,
      note: '',
      retryMode,
      retryModeRaw: '',
    };

    if (stage === 'intent') {
      let mode = null;
      while (!mode) {
        const modeAnswer = await askLine(rl, intentModeQuestion);
        mode = parseIntentRetryMode(modeAnswer);
        if (!mode) {
          console.log('입력 형식 오류: 1 또는 2로 입력해 주세요');
          continue;
        }

        answers.retryModeRaw = String(modeAnswer ?? '').trim();
        retryMode = mode;
        answers.retryMode = retryMode;
      }

      questions.push(intentModeQuestion);
      if (retryMode === 'codebase') {
        note = String(intentGuidance?.defaultNote || '').trim();
        if (note) {
          console.log(
            '[ui-components] [intent] 코드베이스 기준 보강 지시를 적용합니다'
          );
          console.log(`  - ${note}`);
        }
      } else {
        note = String((await askLine(rl, noteQuestion)) ?? '').trim();
        questions.push(noteQuestion);
      }
    } else {
      note = String((await askLine(rl, noteQuestion)) ?? '').trim();
      questions.push(noteQuestion);
    }
    answers.note = note;

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
      contextReferences: intentGuidance?.references || [],
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
