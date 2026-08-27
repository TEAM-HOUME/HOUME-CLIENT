/**
 * 로그인 플로우 전용 공통 파라미터
 *
 * **사용 범위 (이 외 화면에서는 사용하지 않음)**
 * - `loginSocial` page_view / CTA (`login_status` 포함 → `getLoginSocialParams`)
 * - `signupForm` page_view / CTA
 * - `signupComp` page_view
 *
 * 약관 링크·로그인 게이트 page_view 보조 파라미터 → `getLoginEntryRouteParams()` (`login_status` 없음)
 *
 * 일반 화면 `return_screen_name` → `getReturnScreenNameParams()`
 * 로그인 게이트 경유 page_view → `getLoginGatePageViewReturnParams()`
 * 이미지 퍼널 → `getReturnScreenNameFromImageEntry()`, `getLoadImgReturnScreenName()`
 * 고정 목적지(로그아웃·탑내비 등) → 이벤트별 `SCREEN_NAME` 명시
 *
 * - GA 저장값(`getLoginEntryRoute`) + 앱 복귀 URL(`getLoginRedirect`)을 조합
 *
 * @example
 * track(EVENTS.LOGIN_SOCIAL_PAGE_VIEW, getLoginSocialParams());
 * // → { login_entry_route: 'home_banner', return_screen_name: 'home' }
 *
 * @see `@analytics/utils/screenName`
 */
import { ROUTES } from '@routes/paths';

import type { LoginEntryRoute } from '@analytics/params/gate';
import { resolveScreenName } from '@analytics/utils/screenName/resolveScreenName';

import { getLoginRedirect } from '@utils/loginRedirect';

import { loginStatusParams } from '../loginStatus';
import { getLoginEntryRoute } from './storeLoginEntryRoute';

export type { LoginEntryRoute };

/** `login_entry_route` + `return_screen_name` (`login_status` 없음) */
export const getLoginEntryRouteParams = () => {
  const returnPath = getLoginRedirect() ?? ROUTES.HOME;

  return {
    // 게이트 없이 진입(직접 URL, ProtectedRoute 리다이렉트 등)하면 undefined — 콘솔에서 확인용, Firebase 전송 시 제외
    login_entry_route: getLoginEntryRoute() ?? undefined,
    return_screen_name: resolveScreenName(returnPath),
  };
};

/** 로그인 플로우 page_view / CTA — `login_status` + `getLoginEntryRouteParams()` */
export const getLoginSocialParams = () => ({
  ...loginStatusParams(),
  ...getLoginEntryRouteParams(),
});
