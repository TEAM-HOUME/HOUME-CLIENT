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

export const INTENT_OVERRIDE_FIELDS = Object.freeze([
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
  {
    key: 'type_mapping_policy',
    category: 'type',
    label: '타입 매핑 정책',
    options: Object.freeze({
      1: 'follow_existing',
      2: 'map_success_to_navigate',
      3: 'add_success_type',
    }),
    descriptions: Object.freeze([
      '1) 기존 타입 재사용',
      '2) success를 NAVIGATE 타입에 매핑',
      '3) SUCCESS 타입 신규 추가',
    ]),
  },
]);

export const MAX_FEEDBACK_NOTES_PER_STAGE = 4;
