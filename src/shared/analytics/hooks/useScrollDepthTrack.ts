import { useEffect, useRef } from 'react';

import type { GaEventName } from '@analytics/events';
import type { AnalyticsScreenName } from '@analytics/params/global';
import {
  createScrollDepthTracker,
  scrollDepthParams,
  type ScrollDepth,
} from '@analytics/params/scrollDepth';
import type { TrackEventParams } from '@analytics/params/types';
import { trackEvent } from '@analytics/track';

type ScrollTrackParams = Omit<TrackEventParams, 'screen_name' | 'scroll_depth'>;

interface UseScrollDepthTrackOptions {
  /** false면 scroll_depth 이벤트 미전송 */
  enabled?: boolean;
  /** 스크롤 컨테이너 (미지정 시 window) */
  getScrollElement?: () => HTMLElement | null;
  extraParams?: ScrollTrackParams;
}

/**
 * scroll_depth 임계값(25/50/75/100) 도달 시 이벤트 1회씩 전송.
 * 실제 scroll 이벤트 발생 후에만 측정 (mount 시 0% 자동 전송 없음).
 */
export const useScrollDepthTrack = (
  eventName: GaEventName,
  screenName: AnalyticsScreenName,
  options?: UseScrollDepthTrackOptions
): void => {
  const trackerRef = useRef(createScrollDepthTracker());
  const extraParamsRef = useRef(options?.extraParams);
  extraParamsRef.current = options?.extraParams;
  const getScrollElementRef = useRef(options?.getScrollElement);
  getScrollElementRef.current = options?.getScrollElement;

  useEffect(() => {
    if (options?.enabled === false) return;

    const tracker = trackerRef.current;
    tracker.reset();

    const onReachDepth = (depth: ScrollDepth) => {
      if (depth === 0) return;

      trackEvent(eventName, {
        ...extraParamsRef.current,
        screen_name: screenName,
        ...scrollDepthParams(depth),
      });
    };

    const handleWindowScroll = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const percent = maxScroll <= 0 ? 0 : (window.scrollY / maxScroll) * 100;

      tracker.trackFromPercent(percent, onReachDepth);
    };

    const getScrollElement = getScrollElementRef.current;
    if (!getScrollElement) {
      window.addEventListener('scroll', handleWindowScroll, { passive: true });

      return () => {
        window.removeEventListener('scroll', handleWindowScroll);
        tracker.reset();
      };
    }

    let boundElement: HTMLElement | null = null;
    let retryTimerId: number | undefined;

    const getElementScrollPercent = (element: HTMLElement): number => {
      const maxScroll = element.scrollHeight - element.clientHeight;
      return maxScroll <= 0 ? 0 : (element.scrollTop / maxScroll) * 100;
    };

    const getWindowScrollPercent = (): number => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      return maxScroll <= 0 ? 0 : (window.scrollY / maxScroll) * 100;
    };

    const handleScroll = () => {
      const elementPercent = boundElement
        ? getElementScrollPercent(boundElement)
        : 0;

      tracker.trackFromPercent(
        Math.max(elementPercent, getWindowScrollPercent()),
        onReachDepth
      );
    };

    const unbindElement = () => {
      if (!boundElement) return;

      boundElement.removeEventListener('scroll', handleScroll);
      boundElement = null;
    };

    const bindElement = (element: HTMLElement) => {
      if (boundElement === element) return;

      unbindElement();
      boundElement = element;
      element.addEventListener('scroll', handleScroll, {
        passive: true,
      });
    };

    const waitForScrollElement = () => {
      const element = getScrollElementRef.current?.() ?? null;

      if (element) {
        bindElement(element);
        return;
      }

      retryTimerId = window.setTimeout(waitForScrollElement, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    waitForScrollElement();

    return () => {
      if (retryTimerId !== undefined) {
        window.clearTimeout(retryTimerId);
      }
      window.removeEventListener('scroll', handleScroll);
      unbindElement();
      tracker.reset();
    };
  }, [eventName, screenName, options?.enabled]);
};
