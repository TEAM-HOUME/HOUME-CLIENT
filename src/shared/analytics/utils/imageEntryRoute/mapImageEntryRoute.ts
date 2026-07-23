/**
 * 이미지 퍼널 ENTRY_ROUTE → GA image_entry_route
 *
 * - 앱 도메인(`useImageFlowStore.ENTRY_ROUTE`)과 GA enum(`IMAGE_ENTRY_ROUTE`) 연결 SSOT
 * - `login_entry_route`와 달리 별도 저장소를 두지 않음 → `useImageFlowStore.entryRoute`가 이미 sessionStorage에 persist되므로 그대로 소스로 사용
 *
 * @example
 * trackEvent(GA_EVENTS.selectMoodboard.PAGE_VIEW, {
 *   image_entry_route: getEntryRoute(),
 * });
 */
import { ENTRY_ROUTE, type EntryRoute } from '@store/imageFlow/flowConfig';

import {
  IMAGE_ENTRY_ROUTE,
  type ImageEntryRoute,
} from '@shared/analytics/params/gate';

const ENTRY_TO_IMAGE_ENTRY_ROUTE: Record<EntryRoute, ImageEntryRoute> = {
  [ENTRY_ROUTE.GENERATE_BUTTON]: IMAGE_ENTRY_ROUTE.TOP_NAV,
  [ENTRY_ROUTE.HOME_BANNER]: IMAGE_ENTRY_ROUTE.HOME_BANNER,
  [ENTRY_ROUTE.FLOOR_PLAN]: IMAGE_ENTRY_ROUTE.HOME_SPACE,
  [ENTRY_ROUTE.STYLE_RESTYLE]: IMAGE_ENTRY_ROUTE.HOME_STYLE,
  [ENTRY_ROUTE.PRODUCT_SELECTION]: IMAGE_ENTRY_ROUTE.SHOP,
  [ENTRY_ROUTE.PRODUCT_REGENERATE]: IMAGE_ENTRY_ROUTE.SHOP_REGENERATE,
};

export const mapEntryRouteToImageEntry = (
  entryRoute: EntryRoute
): ImageEntryRoute => ENTRY_TO_IMAGE_ENTRY_ROUTE[entryRoute];
