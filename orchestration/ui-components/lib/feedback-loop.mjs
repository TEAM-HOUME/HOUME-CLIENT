import { createReadStream, createWriteStream, existsSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';

import { truncateText } from './step-utils.mjs';

export const DEFAULT_RETRY_LIMITS = Object.freeze({
  intent: 10,
  plan: 10,
  implement: 10,
  verify: 10,
});

const STAGE_LABELS = Object.freeze({
  intent: '의도',
  plan: '계획',
  implement: '구현',
  verify: '검증',
});

function isInteractiveTerminal() {
  return Boolean(process.stdin.isTTY);
}

function createPromptInterface(stage) {
  if (isInteractiveTerminal()) {
    return {
      rl: createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true,
      }),
      dispose() {},
      source: 'stdin/stdout',
    };
  }
  if (process.platform !== 'win32' && existsSync('/dev/tty')) {
    const inputStream = createReadStream('/dev/tty');
    const outputStream = createWriteStream('/dev/tty');
    return {
      rl: createInterface({
        input: inputStream,
        output: outputStream,
        terminal: true,
      }),
      dispose() {
        inputStream.destroy();
        outputStream.destroy();
      },
      source: '/dev/tty',
    };
  }
  console.log(
    `[ui-components] [${stage}] 입력 채널이 비대화형입니다. 인터랙티브 터미널에서 실행해 주세요`
  );
  return null;
}

async function askLine(rl, question) {
  return rl.question(question);
}

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
  const retryQuestion = `[ui-components] [${stage}] 재시도하시겠습니까? (남은 ${remaining}회, y/n, Enter=y): `;
  const noteQuestion = `[ui-components] [${stage}] 보강 지시 입력 (선택, Enter=생략): `;
  console.log(
    `[ui-components] [${stage}] ${stageLabel} 단계 실패 (${attempt}/${maxAttempts}) - ${truncateText(errorMessage, 220)}`
  );

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
        console.log(
          `[ui-components] [${stage}] 입력 형식 오류: y 또는 n으로 입력해 주세요`
        );
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
    recordFeedbackHistory(context, {
      stage,
      attempt,
      maxAttempts,
      timestamp: new Date().toISOString(),
      errorMessage,
      questions: [retryQuestion, noteQuestion],
      answers: {
        retryAnswerRaw: parsedDecision.raw,
        note,
      },
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

export function appendFeedback(context, stage, value) {
  if (!value || !context.feedbackLoop?.[stage]) {
    return;
  }
  context.feedbackLoop[stage].push(String(value).trim());
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
        decision.note ||
          `Previous plan failure: ${truncateText(errorMessage, 240)}`
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
        decision.note ||
          `Previous intent failure: ${truncateText(errorMessage, 240)}`
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
        decision.note ||
          `Previous implement/path-gate failure: ${truncateText(errorMessage, 240)}`
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
        decision.note ||
          `Previous verify failure: ${truncateText(errorMessage, 240)}`
      );
      appendFeedback(
        context,
        'implement',
        `Fix verify failure before next validation: ${truncateText(errorMessage, 240)}`
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
