import { ENTRY_ROUTE, type EntryRoute } from '@store/imageFlow/flowConfig';
import { useImageFlowStore } from '@store/useImageFlowStore';

import type { ImageEntryRoute } from '@shared/analytics/params/gate';
import { mapEntryRouteToImageEntry } from '@shared/analytics/utils/imageEntryRoute';

/**
 * 상품 탭에서 이미지 퍼널로 진입하기 직전(setFlow 이전)의 GA 진입 경로 결정.
 *
 * store.entryRoute가 이미 product_regenerate면 그대로, 아니면 product_selection으로 간주한다.
 * (일반 image_entry_route는 setFlow 이후 read-only인 `getEntryRoute()`를 쓴다.)
 */
export const resolveShopFlowEntryRoute = (): EntryRoute => {
  const flow = useImageFlowStore.getState().flow;

  return flow?.route === 'PRODUCT_SELECTION' && flow.isRegenerate
    ? ENTRY_ROUTE.PRODUCT_REGENERATE
    : ENTRY_ROUTE.PRODUCT_SELECTION;
};

export const resolveShopImageEntryRoute = (): ImageEntryRoute =>
  mapEntryRouteToImageEntry(resolveShopFlowEntryRoute());
