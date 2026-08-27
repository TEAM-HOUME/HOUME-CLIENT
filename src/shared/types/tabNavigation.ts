// 홈 진입 navigate state 계약 — landing, ResultPage 재선택 등 홈 밖에서 진입할 때 사용
export type HomeTab = 'explore' | 'product' | 'compare';

export type HomeLocationState = {
  activeTab?: HomeTab;
  exploreSeedBannerId?: number;
};
