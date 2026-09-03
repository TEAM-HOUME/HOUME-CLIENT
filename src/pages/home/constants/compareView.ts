/** 비교 탭이 지금 무엇을 그려야 하는지 */
export const COMPARE_VIEW = {
  SEARCH: 'search', // 링크 입력창 + 히스토리 + 프리셋이 보이는 화면
  LOADING: 'loading',
  RESULT: 'result',
  EMPTY: 'empty',
  ERROR: 'error',
} as const;

export type CompareView = (typeof COMPARE_VIEW)[keyof typeof COMPARE_VIEW];
