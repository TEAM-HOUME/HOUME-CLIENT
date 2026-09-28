export const COMPARE_ROLL_INTERVAL_MS = 2_400;

export const COMPARE_LOADING_MESSAGES = {
  SCRAPING: [
    '붙여넣은 링크에 접속하고 있어요.',
    '페이지에서 상품 정보를 불러오고 있어요.',
  ],
  SEARCHING: [
    '쿠팡에서 비슷한 상품을 찾고 있어요.',
    '이베이에서 비슷한 상품을 찾고 있어요.',
  ],
  MERGING: ['찾은 상품들을 검토하고 있어요.'],
  SORTING: [],
} as const;

export type CompareLoadingStage = keyof typeof COMPARE_LOADING_MESSAGES;
