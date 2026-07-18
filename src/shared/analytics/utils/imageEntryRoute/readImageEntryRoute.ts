/**
 * 현재 이미지 퍼널 진입 경로를 GA image_entry_route로 조회
 *
 * - 소스: `useImageFlowStore.entryRoute` (setFlow 시 저장, reset 시 초기화 → 별도 persist/clear 불필요)
 * - entryRoute가 없으면 `undefined` 반환 → 이벤트 param에서 자연히 누락 (stale 값 방지)
 *
 * @example
 * trackEvent(GA_EVENTS.selectMoodboard.PAGE_VIEW, {
 *   image_entry_route: getEntryRoute(),
 * });
 */
import { flowToEntryRoute } from '@store/imageFlow/flowConfig';
import { useImageFlowStore } from '@store/useImageFlowStore';

import type { ImageEntryRoute } from '@shared/analytics/params/gate';

import { mapEntryRouteToImageEntry } from './mapImageEntryRoute';

export const getEntryRoute = (): ImageEntryRoute | undefined => {
  const entryRoute = flowToEntryRoute(useImageFlowStore.getState().flow);

  return entryRoute ? mapEntryRouteToImageEntry(entryRoute) : undefined;
};
