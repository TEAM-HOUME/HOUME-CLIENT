/**
 * 이벤트 볼륨 제어 유틸
 *
 * 무료 플랜 quota를 지키기 위한 샘플링·상한 로직을 순수 함수로 모아둔다.
 * (모듈 스코프 카운터를 쓰는 함수이므로 페이지 새로고침 시 초기화된다)
 */

/** rate(0~1) 확률로 true. 0 이하는 항상 false, 1 이상은 항상 true */
export const shouldSample = (rate: number): boolean => {
  if (rate >= 1) return true;
  if (rate <= 0) return false;

  return Math.random() < rate;
};

/**
 * key별로 세션 내 최대 limit회까지만 통과시키는 게이트를 만든다.
 * 같은 원인이 반복될 때 같은 이벤트가 수백 건 쌓이는 것을 막는다.
 */
export const createSessionCap = (limit: number) => {
  const counts = new Map<string, number>();

  return (key: string): boolean => {
    const current = counts.get(key) ?? 0;
    if (current >= limit) return false;

    counts.set(key, current + 1);
    return true;
  };
};

/**
 * 세션 전체 이벤트 상한
 * 리렌더 루프 같은 에러 하나가 하루치 quota를 소진하는 것을 막는 마지막 방어선
 * (Sentry 대시보드의 Spike Protection과 별개로 동작하는 클라이언트 측 1차 차단)
 */
export const SESSION_EVENT_BUDGET = 20;

let sessionEventCount = 0;

/** 세션 예산을 1 소비한다. 남아있으면 true, 소진됐으면 false */
export const consumeSessionEventBudget = (): boolean => {
  if (sessionEventCount >= SESSION_EVENT_BUDGET) return false;

  sessionEventCount += 1;
  return true;
};

/** 테스트 전용 — 세션 예산 카운터 초기화 */
export const resetSessionEventBudget = () => {
  sessionEventCount = 0;
};
