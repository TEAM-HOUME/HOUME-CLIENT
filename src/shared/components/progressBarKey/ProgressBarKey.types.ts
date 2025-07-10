export const PROGRESS_STEPS = {
  BASIC_INFO: 1,
  FLOOR_PLAN: 2,
  MOOD_BOARD: 3,
  MAIN_ACTIVITY: 4,
} as const;

export type ProgressStep = (typeof PROGRESS_STEPS)[keyof typeof PROGRESS_STEPS];

export interface ProgressBarKeyProps {
  /**
   * 현재 단계
   * - 1: 기본 주거정보
   * - 2: 평면도 선택
   * - 3: 취향 무드보드
   * - 4: 주요 활동
   */
  currentStep: ProgressStep;
}
