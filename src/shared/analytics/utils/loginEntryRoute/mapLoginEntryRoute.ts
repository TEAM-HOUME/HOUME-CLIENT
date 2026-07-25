/**
 * 이미지 퍼널 ENTRY_ROUTE → GA login_entry_route
 *
 * - 앱 도메인(`useImageFlowStore.ENTRY_ROUTE`)과 GA enum(`LOGIN_ENTRY_ROUTE`) 연결 SSOT
 * - call site에서 `mapEntryRouteToLoginEntry`로 변환 후 `requireLogin(action, route)`에 전달
 *
 * @example
 * requireLogin(
 *   () => navigate(ROUTES.IMAGE_SETUP),
 *   mapEntryRouteToLoginEntry(ENTRY_ROUTE.HOME_BANNER)
 * );
 */
import { ENTRY_ROUTE, type EntryRoute } from '@store/imageFlow/flowConfig';

import {
  LOGIN_ENTRY_ROUTE,
  type LoginEntryRoute,
} from '@shared/analytics/params/gate';

import { persistLoginEntryRoute } from './storeLoginEntryRoute';

const ENTRY_TO_LOGIN_ENTRY_ROUTE: Record<EntryRoute, LoginEntryRoute> = {
  [ENTRY_ROUTE.GENERATE_BUTTON]: LOGIN_ENTRY_ROUTE.TOP_NAV_GENERATE,
  [ENTRY_ROUTE.HOME_BANNER]: LOGIN_ENTRY_ROUTE.HOME_BANNER,
  [ENTRY_ROUTE.FLOOR_PLAN]: LOGIN_ENTRY_ROUTE.HOME_SPACE,
  [ENTRY_ROUTE.STYLE_RESTYLE]: LOGIN_ENTRY_ROUTE.HOME_STYLE,
  [ENTRY_ROUTE.PRODUCT_SELECTION]: LOGIN_ENTRY_ROUTE.SHOP_GENERATE,
  // PRODUCT_REGENERATE(결과 페이지 "다시 선택하기")는 항상 로그인 상태에서만 진입하므로
  // 로그인 게이트에 도달할 일이 없음 → Record 완전성 위해 값만 채운 매핑
  [ENTRY_ROUTE.PRODUCT_REGENERATE]: LOGIN_ENTRY_ROUTE.SHOP_GENERATE,
};

export const mapEntryRouteToLoginEntry = (
  entryRoute: EntryRoute
): LoginEntryRoute => ENTRY_TO_LOGIN_ENTRY_ROUTE[entryRoute];

export const persistImageFlowLoginEntry = (entryRoute: EntryRoute): void => {
  persistLoginEntryRoute(mapEntryRouteToLoginEntry(entryRoute));
};
