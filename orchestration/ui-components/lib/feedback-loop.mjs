import { spawnSync } from 'node:child_process';
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

function readProcessField(fieldName) {
  const result = spawnSync(
    'ps',
    ['-o', `${fieldName}=`, '-p', String(process.pid)],
    {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }
  );
  if (result.status !== 0) {
    return null;
  }
  const value = String(result.stdout || '').trim();
  return value || null;
}

function isForegroundProcessGroup() {
  if (!isInteractiveTerminal()) {
    return false;
  }
  if (process.platform === 'win32') {
    return true;
  }
  const pgid = readProcessField('pgid');
  const tpgid = readProcessField('tpgid');
  if (!pgid || !tpgid) {
    return true;
  }
  return pgid === tpgid;
}

function createPromptInterface(stage) {
  if (isInteractiveTerminal() && isForegroundProcessGroup()) {
    return {
      rl: createInterface({
        input: process.stdin,
        output: process.stdout,
        // Plain line reader
        terminal: false,
      }),
      dispose() {},
      source: 'stdin/stdout',
    };
  }
  if (!isInteractiveTerminal()) {
    console.log(
      `[ui-components] [${stage}] 입력 채널이 비대화형입니다. 자동 재시도로 진행합니다`
    );
    return null;
  }
  console.log(
    `[ui-components] [${stage}] 현재 프로세스가 foreground가 아니어서 입력을 받을 수 없습니다. 자동 재시도로 진행합니다`
  );
  return null;
}

async function askLine(rl, question) {
  process.stdout.write(question);
  return rl.question('');
}

function parseRetryInput(rawAnswer) {
  const raw = String(rawAnswer ?? '').trim();
  if (!raw) {
    return { retry: true, note: '', raw };
  }

  const lower = raw.toLowerCase();
  if (lower === 'n' || lower === 'no') {
    return { retry: false, note: '', raw };
  }

  const colonIndex = raw.indexOf(':');
  if (colonIndex >= 0) {
    const head = raw.slice(0, colonIndex).trim().toLowerCase();
    const note = raw.slice(colonIndex + 1).trim();
    if (head === 'n' || head === 'no') {
      return { retry: false, note: '', raw };
    }
    return { retry: true, note, raw };
  }

  return { retry: true, note: '', raw };
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
  const retryQuestion = `[ui-components] [${stage}] 재시도 입력 (남은 ${remaining}회): [Enter|y]=재시도, n=중단, y: <보강지시>=재시도+지시 `;
  console.log(
    `[ui-components] [${stage}] ${stageLabel} 단계 실패 (${attempt}/${maxAttempts}) - ${truncateText(errorMessage, 220)}`
  );

  const promptInterface = createPromptInterface(stage);
  if (!promptInterface) {
    const autoNote = `Auto retry due unavailable interactive input. Previous error: ${truncateText(errorMessage, 220)}`;
    recordFeedbackHistory(context, {
      stage,
      attempt,
      maxAttempts,
      timestamp: new Date().toISOString(),
      errorMessage,
      questions: [retryQuestion],
      answers: {
        retryAnswerRaw: null,
        note: autoNote,
      },
      retry: true,
      inputSource: 'none',
      reason: 'auto_retry_input_unavailable',
    });
    console.log(
      `[ui-components] [${stage}] 입력 없이 자동 재시도합니다 (${attempt + 1}/${maxAttempts})`
    );
    return {
      retry: true,
      note: autoNote,
    };
  }

  const { rl, dispose, source } = promptInterface;

  try {
    const retryAnswer = await askLine(rl, retryQuestion);
    const parsedDecision = parseRetryInput(retryAnswer);
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

    const note = parsedDecision.note;
    recordFeedbackHistory(context, {
      stage,
      attempt,
      maxAttempts,
      timestamp: new Date().toISOString(),
      errorMessage,
      questions: [retryQuestion],
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
