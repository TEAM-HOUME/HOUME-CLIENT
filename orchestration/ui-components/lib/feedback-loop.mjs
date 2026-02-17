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

const INTENT_OVERRIDE_FIELDS = Object.freeze([
  {
    key: 'trigger_policy',
    label: '트리거 정책',
    options: Object.freeze({
      1: 'follow_existing',
      2: 'optimistic_success',
      3: 'after_api_success',
      4: 'after_server_sync',
    }),
    descriptions: Object.freeze([
      '1) 기존 코드 기준',
      '2) 낙관적 업데이트 성공 시점',
      '3) API 성공 응답 시점',
      '4) 서버 동기화 완료 시점',
    ]),
  },
  {
    key: 'placement_policy',
    label: '배치 정책',
    options: Object.freeze({
      1: 'follow_existing',
      2: 'bottom_safe_area',
      3: 'top_safe_area',
    }),
    descriptions: Object.freeze([
      '1) 기존 코드 기준',
      '2) 하단 safe-area 기준',
      '3) 상단 safe-area 기준',
    ]),
  },
  {
    key: 'dismiss_policy',
    label: '닫기 정책',
    options: Object.freeze({
      1: 'follow_existing',
      2: 'auto_3000_with_cta_dismiss',
      3: 'manual_only',
    }),
    descriptions: Object.freeze([
      '1) 기존 코드 기준',
      '2) 자동 3000ms + CTA 클릭 시 닫힘',
      '3) 수동 닫기만 허용',
    ]),
  },
  {
    key: 'concurrency_policy',
    label: '중복 표시 정책',
    options: Object.freeze({
      1: 'follow_existing',
      2: 'replace_latest',
      3: 'queue',
    }),
    descriptions: Object.freeze([
      '1) 기존 코드 기준',
      '2) 최신 토스트로 교체',
      '3) 큐잉 처리',
    ]),
  },
  {
    key: 'accessibility_policy',
    label: '접근성 정책',
    options: Object.freeze({
      1: 'follow_existing',
      2: 'aria_polite',
      3: 'aria_assertive',
    }),
    descriptions: Object.freeze([
      '1) 기존 코드 기준',
      '2) aria-live polite',
      '3) aria-live assertive',
    ]),
  },
]);

const MAX_FEEDBACK_NOTES_PER_STAGE = 4;
const MAX_FEEDBACK_NOTE_LENGTH = 280;

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

async function askIntentChoice(rl, stage, field) {
  const basePrompt = [
    `[ui-components] [${stage}] ${field.label} 선택 (Enter=미지정):`,
    ...field.descriptions.map(
      (description) => `[ui-components] [${stage}]   - ${description}`
    ),
    `[ui-components] [${stage}] 선택값: `,
  ].join('\n');

  while (true) {
    const answer = String((await askLine(rl, basePrompt)) ?? '').trim();
    if (!answer) {
      return '';
    }
    if (field.options[answer]) {
      return field.options[answer];
    }
    console.log(
      `[ui-components] [${stage}] 입력 형식 오류: ${field.label}은 제시된 번호로 입력해 주세요`
    );
  }
}

function normalizeOverrideObject(rawValue) {
  if (!rawValue || typeof rawValue !== 'object' || Array.isArray(rawValue)) {
    return null;
  }
  const normalized = Object.fromEntries(
    Object.entries(rawValue)
      .map(([key, value]) => [String(key), String(value ?? '').trim()])
      .filter(([, value]) => Boolean(value))
  );
  if (Object.keys(normalized).length === 0) {
    return null;
  }
  return normalized;
}

function mergeIntentOverrides(context, overrides) {
  const normalized = normalizeOverrideObject(overrides);
  if (!normalized) {
    return null;
  }

  if (
    !context.intentOverrides ||
    typeof context.intentOverrides !== 'object' ||
    Array.isArray(context.intentOverrides)
  ) {
    context.intentOverrides = {};
  }
  Object.assign(context.intentOverrides, normalized);
  return normalized;
}

function buildIntentOverrideFeedback(overrides) {
  const normalized = normalizeOverrideObject(overrides);
  if (!normalized) {
    return '';
  }
  const parts = Object.entries(normalized).map(
    ([key, value]) => `${key}=${value}`
  );
  return `Intent override decisions: ${parts.join('; ')}`;
}

function printIntentOverrideSummary(stage, overrides) {
  const normalized = normalizeOverrideObject(overrides);
  if (!normalized) {
    return;
  }
  console.log(`[ui-components] [${stage}] 구조화 보강 적용`);
  for (const [key, value] of Object.entries(normalized)) {
    console.log(`[ui-components] [${stage}]   - ${key}: ${value}`);
  }
}

async function collectIntentStructuredOverrides(rl, stage) {
  const overrides = {};
  for (const field of INTENT_OVERRIDE_FIELDS) {
    const value = await askIntentChoice(rl, stage, field);
    if (value) {
      overrides[field.key] = value;
    }
  }

  const ctaTarget = String(
    (await askLine(
      rl,
      `[ui-components] [${stage}] CTA 대상 경로/의미 입력 (선택, Enter=미지정): `
    )) ?? ''
  ).trim();
  if (ctaTarget) {
    overrides.cta_target = ctaTarget;
  }

  const additionalPrompt = String(
    (await askLine(
      rl,
      `[ui-components] [${stage}] 추가 프롬프트 입력 (선택, Enter=생략): `
    )) ?? ''
  ).trim();
  if (additionalPrompt) {
    overrides.additional_prompt = additionalPrompt;
  }

  return overrides;
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
  const noteQuestion = `[ui-components] [${stage}] 자유 보강 지시 입력 (선택, Enter=생략): `;
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

    const note = String((await askLine(rl, noteQuestion)) ?? '').trim();
    const structuredOverrides =
      stage === 'intent'
        ? await collectIntentStructuredOverrides(rl, stage)
        : {};
    const appliedOverrides = mergeIntentOverrides(context, structuredOverrides);
    if (stage === 'intent') {
      printIntentOverrideSummary(stage, appliedOverrides);
    }
    const intentOverrideFeedback =
      stage === 'intent' ? buildIntentOverrideFeedback(appliedOverrides) : '';
    const mergedNote = [note, intentOverrideFeedback]
      .filter(Boolean)
      .join(' || ');
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

  const normalized = truncateText(
    String(value).trim(),
    MAX_FEEDBACK_NOTE_LENGTH
  );
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
