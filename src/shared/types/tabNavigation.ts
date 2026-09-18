// 홈 진입 navigate state 계약 — landing, ResultPage 재선택 등 홈 밖에서 진입할 때 사용

/** 홈 탭 값 목록. URL의 tab 파라미터 값이기도 하다 (parseHomeTab) */
export const HOME_TABS = ['explore', 'product', 'compare'] as const;

export type HomeTab = (typeof HOME_TABS)[number];

export type HomeLocationState = {
  activeTab?: HomeTab;
  exploreSeedBannerId?: number;
};
