import type { AnalyticsScreenName } from '@analytics/params/global';

import { resolveScreenName } from './resolveScreenName';

let previousScreenName: AnalyticsScreenName | undefined;
let currentScreenName: AnalyticsScreenName | undefined;

/**
 * 라우트(pathname + search) 변경 시 screen_name 스택 갱신
 * RootLayout `useScreenNavigation`에서 1회 호출
 */
export const updateScreenNavigation = (pathWithSearch: string): void => {
  const next = resolveScreenName(pathWithSearch);

  if (currentScreenName !== undefined && currentScreenName !== next) {
    previousScreenName = currentScreenName;
  }

  currentScreenName = next;
};

/** 직전 화면 screen_name — page_view `previous_screen_name`용 */
export const getPreviousScreenName = (): AnalyticsScreenName | undefined =>
  previousScreenName;

/** 현재 화면 screen_name (디버그·테스트용) */
export const getCurrentScreenName = (): AnalyticsScreenName | undefined =>
  currentScreenName;

/** 테스트/스토리북용 초기화 */
export const resetScreenNavigation = (): void => {
  previousScreenName = undefined;
  currentScreenName = undefined;
};
