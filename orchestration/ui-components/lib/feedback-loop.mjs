import { createReadStream, createWriteStream, existsSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';

import { splitErrorDetails, truncateText } from './step-utils.mjs';

export const DEFAULT_RETRY_LIMITS = Object.freeze({
  intent: 10,
  asset: 10,
  plan: 10,
  implement: 10,
  verify: 10,
});

const STAGE_LABELS = Object.freeze({
  intent: '의도',
  asset: '자산 커버리지',
  plan: '계획',
  implement: '구현',
  verify: '검증',
});

const INTENT_OVERRIDE_FIELDS = Object.freeze([
  {
    key: 'trigger_policy',
    category: 'trigger',
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
    category: 'placement',
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
    category: 'dismiss',
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
    category: 'concurrency',
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
    category: 'accessibility',
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

function printStageHeader(stage, title) {
  console.log(`[ui-components] [${stage}] ${title}`);
}

function printStageOptions(options) {
  if (!Array.isArray(options) || options.length === 0) {
    return;
  }
  const content = options.map((option) => `  - ${option}`).join('\n');
  console.log(content);
}

async function askIntentChoice(rl, stage, field, required = false) {
  const requiredTag = required ? ' [필수]' : '';
  printStageHeader(stage, `${field.label}${requiredTag} 선택`);
  printStageOptions(field.descriptions);

  while (true) {
    const answer = String(
      (await askLine(
        rl,
        `[ui-components] [${stage}] 선택값 (Enter=미지정): `
      )) ?? ''
    ).trim();
    if (!answer) {
      if (required) {
        console.log(
          `[ui-components] [${stage}] 입력 필요: ${field.label}은(는) 필수 항목입니다`
        );
        continue;
      }
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

async function askAssetModeChoice(rl, stage) {
  printStageHeader(stage, '자산 커버리지 게이트 모드 선택');
  printStageOptions(['1) 기존 유지', '2) warn', '3) error']);

  while (true) {
    const answer = String(
      (await askLine(
        rl,
        `[ui-components] [${stage}] 선택값 (Enter=기존 유지): `
      )) ?? ''
    ).trim();
    if (!answer || answer === '1') {
      return '';
    }
    if (answer === '2') {
      return 'warn';
    }
    if (answer === '3') {
      return 'error';
    }
    console.log(
      `[ui-components] [${stage}] 입력 형식 오류: 1, 2, 3 중 하나를 입력해 주세요`
    );
  }
}

async function askOptionalPositiveInteger(rl, stage, label, hint) {
  const prompt = `[ui-components] [${stage}] ${label} 입력 (선택, Enter=기존 유지${hint ? `, ${hint}` : ''}): `;
  while (true) {
    const answer = String((await askLine(rl, prompt)) ?? '').trim();
    if (!answer) {
      return '';
    }
    const numeric = Number(answer);
    if (Number.isInteger(numeric) && numeric > 0) {
      return String(numeric);
    }
    console.log(
      `[ui-components] [${stage}] 입력 형식 오류: 1 이상의 정수로 입력해 주세요`
    );
  }
}

function normalizeNodeId(rawValue) {
  const normalized = String(rawValue ?? '')
    .trim()
    .replace(/-/g, ':');
  if (!normalized) {
    return null;
  }
  const tail = normalized.includes(';')
    ? normalized.split(';').at(-1) || ''
    : normalized;
  const withoutInstancePrefix = tail.replace(/^i(?=\d+:\d+$)/i, '');
  if (!/^\d+:\d+$/.test(withoutInstancePrefix)) {
    return null;
  }
  return withoutInstancePrefix;
}

function normalizeNodeIdList(rawValue) {
  const tokens = String(rawValue ?? '')
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  const unique = new Set();
  for (const token of tokens) {
    const normalized = normalizeNodeId(token);
    if (normalized) {
      unique.add(normalized);
    }
  }
  return [...unique];
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

function mergeAssetOverrides(context, overrides) {
  const normalized = normalizeOverrideObject(overrides);
  if (!normalized) {
    return null;
  }

  if (
    !context.assetProbeOverrides ||
    typeof context.assetProbeOverrides !== 'object' ||
    Array.isArray(context.assetProbeOverrides)
  ) {
    context.assetProbeOverrides = {
      additionalNodeIds: [],
      maxCandidates: null,
      timeoutMs: null,
    };
  }

  if (normalized.asset_additional_node_ids) {
    const list = normalizeNodeIdList(normalized.asset_additional_node_ids);
    context.assetProbeOverrides.additionalNodeIds = list;
    normalized.asset_additional_node_ids = list.join(',');
  }

  if (normalized.asset_probe_max_candidates) {
    const maxCandidates = Number(normalized.asset_probe_max_candidates);
    if (Number.isInteger(maxCandidates) && maxCandidates > 0) {
      context.assetProbeOverrides.maxCandidates = maxCandidates;
      normalized.asset_probe_max_candidates = String(maxCandidates);
    } else {
      delete normalized.asset_probe_max_candidates;
    }
  }

  if (normalized.asset_probe_timeout_ms) {
    const timeoutMs = Number(normalized.asset_probe_timeout_ms);
    if (Number.isInteger(timeoutMs) && timeoutMs > 0) {
      context.assetProbeOverrides.timeoutMs = timeoutMs;
      normalized.asset_probe_timeout_ms = String(timeoutMs);
    } else {
      delete normalized.asset_probe_timeout_ms;
    }
  }

  if (normalized.asset_coverage_mode) {
    const mode = String(normalized.asset_coverage_mode).trim().toLowerCase();
    if (mode === 'warn' || mode === 'error' || mode === 'off') {
      context.scenario.gates.assetCoverageMode = mode;
      normalized.asset_coverage_mode = mode;
    } else {
      delete normalized.asset_coverage_mode;
    }
  }

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

function buildAssetOverrideFeedback(overrides) {
  const normalized = normalizeOverrideObject(overrides);
  if (!normalized) {
    return '';
  }
  const parts = Object.entries(normalized).map(
    ([key, value]) => `${key}=${value}`
  );
  return `Asset override decisions: ${parts.join('; ')}`;
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

function printAssetOverrideSummary(stage, overrides) {
  const normalized = normalizeOverrideObject(overrides);
  if (!normalized) {
    return;
  }
  console.log(`[ui-components] [${stage}] 구조화 보강 적용`);
  for (const [key, value] of Object.entries(normalized)) {
    console.log(`[ui-components] [${stage}]   - ${key}: ${value}`);
  }
}

async function collectIntentStructuredOverrides(
  rl,
  stage,
  requiredCategories = []
) {
  const requiredSet = new Set(
    Array.isArray(requiredCategories) ? requiredCategories : []
  );
  const overrides = {};
  for (const field of INTENT_OVERRIDE_FIELDS) {
    const value = await askIntentChoice(
      rl,
      stage,
      field,
      requiredSet.has(field.category)
    );
    if (value) {
      overrides[field.key] = value;
    }
  }

  const ctaRequired = requiredSet.has('cta');
  let ctaTarget = '';
  while (true) {
    ctaTarget = String(
      (await askLine(
        rl,
        `[ui-components] [${stage}] CTA 대상 경로/의미 입력${ctaRequired ? ' [필수]' : ''} (Enter=미지정): `
      )) ?? ''
    ).trim();
    if (!ctaRequired || ctaTarget) {
      break;
    }
    console.log(
      `[ui-components] [${stage}] 입력 필요: CTA 대상은 필수 항목입니다`
    );
  }
  if (ctaTarget) {
    overrides.cta_target = ctaTarget;
  }

  return overrides;
}

async function collectAssetStructuredOverrides(rl, stage) {
  const overrides = {};
  const additionalNodeIds = String(
    (await askLine(
      rl,
      `[ui-components] [${stage}] 추가 탐색 노드 ID 입력 (선택, 콤마/공백 구분, 예: 1:427 1:428): `
    )) ?? ''
  ).trim();
  if (additionalNodeIds) {
    overrides.asset_additional_node_ids = additionalNodeIds;
  }

  const maxCandidates = await askOptionalPositiveInteger(
    rl,
    stage,
    'asset probe 후보 수',
    '권장 4~16'
  );
  if (maxCandidates) {
    overrides.asset_probe_max_candidates = maxCandidates;
  }

  const timeoutMs = await askOptionalPositiveInteger(
    rl,
    stage,
    'asset probe timeout(ms)',
    '예: 120000'
  );
  if (timeoutMs) {
    overrides.asset_probe_timeout_ms = timeoutMs;
  }

  const assetCoverageMode = await askAssetModeChoice(rl, stage);
  if (assetCoverageMode) {
    overrides.asset_coverage_mode = assetCoverageMode;
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
  const parsedError = splitErrorDetails(errorMessage);
  console.log(
    `[ui-components] [${stage}] ${stageLabel} 단계 실패 (${attempt}/${maxAttempts})`
  );
  if (parsedError.summary) {
    console.log(`[ui-components] [${stage}] - 사유: ${parsedError.summary}`);
  }
  if (parsedError.details.length > 0) {
    parsedError.details.forEach((detail, index) => {
      console.log(
        `[ui-components] [${stage}]   - 상세 ${index + 1}: ${detail}`
      );
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
    const requiredIntentCategories =
      stage === 'intent' &&
      Array.isArray(context.intentGate?.blockingCategories)
        ? context.intentGate.blockingCategories
        : [];
    if (stage === 'intent' && requiredIntentCategories.length > 0) {
      console.log(
        `[ui-components] [${stage}] 현재 블로킹 모호점 카테고리: ${requiredIntentCategories.join(', ')}`
      );
    }
    const structuredOverrides =
      stage === 'intent'
        ? await collectIntentStructuredOverrides(
            rl,
            stage,
            requiredIntentCategories
          )
        : stage === 'asset'
          ? await collectAssetStructuredOverrides(rl, stage)
          : {};
    const appliedOverrides =
      stage === 'intent'
        ? mergeIntentOverrides(context, structuredOverrides)
        : stage === 'asset'
          ? mergeAssetOverrides(context, structuredOverrides)
          : null;
    if (stage === 'intent') {
      printIntentOverrideSummary(stage, appliedOverrides);
    } else if (stage === 'asset') {
      printAssetOverrideSummary(stage, appliedOverrides);
    }
    const structuredFeedback =
      stage === 'intent'
        ? buildIntentOverrideFeedback(appliedOverrides)
        : stage === 'asset'
          ? buildAssetOverrideFeedback(appliedOverrides)
          : '';
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
        decision.note ||
          `Previous asset coverage failure: ${truncateText(errorMessage, 240)}`
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
