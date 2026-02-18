export const DEFAULT_RETRY_LIMITS = Object.freeze({
  intent: 10,
  asset: 10,
  plan: 10,
  implement: 10,
  verify: 10,
});

export const STAGE_LABELS = Object.freeze({
  intent: '의도',
  asset: '자산 커버리지',
  plan: '계획',
  implement: '구현',
  verify: '검증',
});

export const MAX_FEEDBACK_NOTES_PER_STAGE = Number.POSITIVE_INFINITY;
