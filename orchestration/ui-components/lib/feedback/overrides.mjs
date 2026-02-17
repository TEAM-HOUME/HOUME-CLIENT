import { INTENT_OVERRIDE_FIELDS } from './constants.mjs';
import {
  askLine,
  askOptionalPositiveIntegerCompact,
  askYesNo,
  printStageHeader,
  printStageOptions,
} from './prompt-io.mjs';

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

async function askIntentChoice(rl, stage, field, required = false) {
  const requiredTag = required ? ' [필수]' : '';
  printStageHeader(stage, `${field.label}${requiredTag} 선택`);
  printStageOptions(field.descriptions);

  while (true) {
    const answer = String(
      (await askLine(rl, '  - 선택값 (Enter=미지정): ')) ?? ''
    ).trim();
    if (!answer) {
      if (required) {
        console.log(`입력 필요: ${field.label}은(는) 필수 항목입니다`);
        continue;
      }
      return '';
    }
    if (field.options[answer]) {
      return field.options[answer];
    }
    console.log(`입력 형식 오류: ${field.label}은 제시된 번호로 입력해 주세요`);
  }
}

async function askAssetModeChoice(rl, stage) {
  printStageHeader(stage, '자산 커버리지 게이트 모드 선택');
  printStageOptions(['1) 기존 유지', '2) warn', '3) error']);

  while (true) {
    const answer = String(
      (await askLine(rl, '  - 선택값 (Enter=기존 유지): ')) ?? ''
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
    console.log('입력 형식 오류: 1, 2, 3 중 하나를 입력해 주세요');
  }
}

export function mergeIntentOverrides(context, overrides) {
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

export function mergeAssetOverrides(context, overrides) {
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

export function buildIntentOverrideFeedback(overrides) {
  const normalized = normalizeOverrideObject(overrides);
  if (!normalized) {
    return '';
  }
  const parts = Object.entries(normalized).map(
    ([key, value]) => `${key}=${value}`
  );
  return `Intent override decisions: ${parts.join('; ')}`;
}

export function buildAssetOverrideFeedback(overrides) {
  const normalized = normalizeOverrideObject(overrides);
  if (!normalized) {
    return '';
  }
  const parts = Object.entries(normalized).map(
    ([key, value]) => `${key}=${value}`
  );
  return `Asset override decisions: ${parts.join('; ')}`;
}

export function printIntentOverrideSummary(stage, overrides) {
  const normalized = normalizeOverrideObject(overrides);
  if (!normalized) {
    return;
  }
  console.log(`[ui-components] [${stage}] 구조화 보강 적용`);
  for (const [key, value] of Object.entries(normalized)) {
    console.log(`  - ${key}: ${value}`);
  }
}

export function printAssetOverrideSummary(stage, overrides) {
  const normalized = normalizeOverrideObject(overrides);
  if (!normalized) {
    return;
  }
  console.log(`[ui-components] [${stage}] 구조화 보강 적용`);
  for (const [key, value] of Object.entries(normalized)) {
    console.log(`  - ${key}: ${value}`);
  }
}

export async function collectIntentStructuredOverrides(
  rl,
  stage,
  requiredCategories = []
) {
  const requiredSet = new Set(
    Array.isArray(requiredCategories) ? requiredCategories : []
  );
  const overrides = {};
  const requiredFields = INTENT_OVERRIDE_FIELDS.filter((field) =>
    requiredSet.has(field.category)
  );
  const optionalFields = INTENT_OVERRIDE_FIELDS.filter(
    (field) => !requiredSet.has(field.category)
  );

  for (const field of requiredFields) {
    const value = await askIntentChoice(rl, stage, field, true);
    if (value) {
      overrides[field.key] = value;
    }
  }

  const ctaRequired = requiredSet.has('cta');
  const hasKnownStructuredRequired = requiredFields.length > 0 || ctaRequired;
  if (!hasKnownStructuredRequired && requiredSet.has('unknown')) {
    printStageHeader(
      stage,
      '현재 블로킹 모호점은 구조화 항목으로 매핑되지 않았습니다 (unknown)'
    );
    printStageOptions([
      '자유 보강 지시에서 구체 정책(예: 타입 매핑/기존 타입 재사용 여부)을 직접 입력해 주세요',
    ]);
  }

  const askOptionalStructured =
    optionalFields.length > 0 &&
    (await askYesNo(rl, '선택 구조화 항목도 입력하시겠습니까? (y/N): ', false));

  if (askOptionalStructured) {
    for (const field of optionalFields) {
      const value = await askIntentChoice(rl, stage, field, false);
      if (value) {
        overrides[field.key] = value;
      }
    }
  }

  let ctaTarget = '';
  if (ctaRequired || askOptionalStructured) {
    while (true) {
      ctaTarget = String(
        (await askLine(
          rl,
          `CTA 대상 경로/의미 입력${ctaRequired ? ' [필수]' : ''} (Enter=미지정): `
        )) ?? ''
      ).trim();
      if (!ctaRequired || ctaTarget) {
        break;
      }
      console.log('입력 필요: CTA 대상은 필수 항목입니다');
    }
    if (ctaTarget) {
      overrides.cta_target = ctaTarget;
    }
  }

  if (requiredSet.has('unknown')) {
    let unknownResolution = '';
    while (true) {
      unknownResolution = String(
        (await askLine(
          rl,
          'unknown 모호점 해소 지시 [필수] (예: 기존 TOAST_TYPE.NAVIGATE 재사용): '
        )) ?? ''
      ).trim();
      if (unknownResolution) {
        break;
      }
      console.log('입력 필요: unknown 모호점 해소 지시는 필수입니다');
    }
    overrides.unknown_resolution = unknownResolution;
  }

  return overrides;
}

export async function collectAssetStructuredOverrides(rl, stage) {
  const overrides = {};
  printStageHeader(stage, '자산 재시도 입력');
  printStageOptions([
    '필수 아님: 기본값 유지 시 Enter로 모두 건너뛸 수 있습니다',
    '권장: 먼저 추가 탐색 노드 ID만 입력하고 재시도',
  ]);

  const additionalNodeIds = String(
    (await askLine(
      rl,
      '  - 추가 탐색 노드 ID (선택, 콤마/공백 구분, 예: 1:427 1:428): '
    )) ?? ''
  ).trim();
  if (additionalNodeIds) {
    overrides.asset_additional_node_ids = additionalNodeIds;
  }

  const useAdvancedOptions = await askYesNo(
    rl,
    '고급 옵션(후보 수/timeout/게이트 모드)도 조정하시겠습니까? (y/N): ',
    false
  );

  if (useAdvancedOptions) {
    const maxCandidates = await askOptionalPositiveIntegerCompact(
      rl,
      'asset probe 후보 수',
      'Enter=기존 유지, 권장 4~16'
    );
    if (maxCandidates) {
      overrides.asset_probe_max_candidates = maxCandidates;
    }

    const timeoutMs = await askOptionalPositiveIntegerCompact(
      rl,
      'asset probe timeout(ms)',
      'Enter=기존 유지, 예: 120000'
    );
    if (timeoutMs) {
      overrides.asset_probe_timeout_ms = timeoutMs;
    }

    const assetCoverageMode = await askAssetModeChoice(rl, stage);
    if (assetCoverageMode) {
      overrides.asset_coverage_mode = assetCoverageMode;
    }
  }

  return overrides;
}
