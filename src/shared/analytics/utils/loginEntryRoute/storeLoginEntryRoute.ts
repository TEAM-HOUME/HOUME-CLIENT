/**
 * GA login_entry_route 저장소
 *
 * - 앱 복귀 URL(`loginRedirect.ts`)과 분리된 GA 전용 sessionStorage 레이어
 * - 로그인 페이지 이벤트(`getLoginSocialParams`)에서 `login_entry_route` 파라미터로 사용
 *
 * @example
 * persistLoginEntryRoute(LOGIN_ENTRY_ROUTE.PRODUCT_CARD_SAVE);
 * // → loginSocial_page_view 시 login_entry_route: 'product_card_save'
 */
import {
  LOGIN_ENTRY_ROUTE,
  type LoginEntryRoute,
} from '@analytics/params/gate';

const LOGIN_ENTRY_ROUTE_KEY = 'loginEntryRoute';

const LOGIN_ENTRY_ROUTE_VALUES = new Set<string>(
  Object.values(LOGIN_ENTRY_ROUTE)
);

const isLoginEntryRoute = (value: string): value is LoginEntryRoute =>
  LOGIN_ENTRY_ROUTE_VALUES.has(value);

/** GA login_entry_route enum 저장 */
export const persistLoginEntryRoute = (entryRoute: LoginEntryRoute): void => {
  sessionStorage.setItem(LOGIN_ENTRY_ROUTE_KEY, entryRoute);
};

export const getLoginEntryRoute = (): LoginEntryRoute | null => {
  const value = sessionStorage.getItem(LOGIN_ENTRY_ROUTE_KEY);

  if (!value || !isLoginEntryRoute(value)) {
    return null;
  }

  return value;
};

/** 로그인 게이트 없이 진입할 때 이전 GA 값 제거 */
export const clearLoginEntryRoute = (): void => {
  sessionStorage.removeItem(LOGIN_ENTRY_ROUTE_KEY);
};
