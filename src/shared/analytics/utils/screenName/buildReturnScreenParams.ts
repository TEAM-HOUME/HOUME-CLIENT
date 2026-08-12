import type { AnalyticsScreenName } from '@analytics/params/global';
import { getLoginEntryRouteParams } from '@analytics/utils/loginEntryRoute/buildLoginSocialEventParams';

import { getLoginRedirect } from '@utils/loginRedirect';

import { getPreviousScreenName } from './updateScreenNameStack';

/**
 * `return_screen_name` — 라우트 스택 정책
 *
 * `useScreenNavigation`이 갱신한 직전 화면을 사용하고, 스택이 비어 있으면 fallback.
 * 뒤로가기·일반 page_view 보조 파라미터에 사용.
 *
 * @see docs/ga-wiring-convention.md § return_screen_name
 */
export const getReturnScreenName = (
  fallback: AnalyticsScreenName
): AnalyticsScreenName => getPreviousScreenName() ?? fallback;

/** 스택 기반 — `{ return_screen_name }` */
export const getReturnScreenNameParams = (fallback: AnalyticsScreenName) => ({
  return_screen_name: getReturnScreenName(fallback),
});

/**
 * 로그인 게이트 경유 page_view용
 *
 * - `loginRedirect` 세션 있음 → `getLoginEntryRouteParams()` (`login_status` 없음)
 * - 없음 → 스택 정책 + fallback
 */
export const getLoginGatePageViewReturnParams = (
  fallback: AnalyticsScreenName
) => {
  if (getLoginRedirect()) {
    return getLoginEntryRouteParams();
  }

  return getReturnScreenNameParams(fallback);
};
