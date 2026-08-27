import { useEffect, useRef } from 'react';

import type { GaEventName } from '@analytics/events';
import type { AnalyticsScreenName } from '@analytics/params/global';
import type { TrackEventParams } from '@analytics/params/types';
import { trackEvent } from '@analytics/track';

type PageViewParams = Omit<TrackEventParams, 'screen_name'>;

interface UseAnalyticsPageViewOptions {
  /** false면 page_view 미전송 (데이터 로딩 대기 등) */
  enabled?: boolean;
  /** 값이 바뀌면 같은 화면(event/screen)에서 page_view를 다시 발사 (예: 결과 페이지 내 연관 이미지 이동) */
  refireKey?: string | number;
}

/**
 * page_view 1회 전송 (마운트 시)
 * - `previous_screen_name` 등 추가 params는 호출부에서 스펙에 맞게 전달
 */
export const useAnalyticsPageView = (
  eventName: GaEventName,
  screenName: AnalyticsScreenName,
  params?: PageViewParams,
  options?: UseAnalyticsPageViewOptions
): void => {
  const paramsRef = useRef(params);
  paramsRef.current = params;

  useEffect(() => {
    if (options?.enabled === false) return;

    trackEvent(eventName, {
      ...paramsRef.current,
      screen_name: screenName,
    });
    // page_view는 screen/event 기준 1회 — params 객체 identity 변경으로는 재전송하지 않음(refireKey 변경 시에만 재발사)
  }, [eventName, screenName, options?.enabled, options?.refireKey]);
};
