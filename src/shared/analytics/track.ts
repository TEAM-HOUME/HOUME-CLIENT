/**
 * GA4 이벤트 전송 코어
 *
 * - `trackEvent`: 호출부 params를 콘솔에 그대로 로그 (`undefined` 포함)
 * - Firebase 전송 시에만 `undefined` 키 제거
 * - `trackCallback`: trackEvent 후 기존 onClick 콜백 실행
 */
import { logEvent } from 'firebase/analytics';

import { analytics } from '@shared/config/firebase';
import { addReportBreadcrumb } from '@shared/monitoring/report';
import { redactUrl } from '@shared/monitoring/scrub';

import type { GaEventName } from '@analytics/events';
import type {
  AnalyticsParamValue,
  TrackEventParams,
} from '@analytics/params/types';

export type { LoginStatus } from '@analytics/params/global';
export type { TrackEventParams } from '@analytics/params/types';

/** Firebase Analytics 실제 전송 여부 (.env) */
const isAnalyticsEnabled =
  import.meta.env.VITE_ENABLE_FIREBASE_ANALYTICS === 'true';

const buildEventParams = (
  params?: TrackEventParams
): Record<string, AnalyticsParamValue> => {
  return Object.fromEntries(
    Object.entries(params ?? {}).filter(([, value]) => value !== undefined)
  );
};

/**
 * breadcrumb에 실을 파라미터를 만든다.
 *
 * `page_path`만 URL 스크럽을 통과시킨다 — 주소에 카카오 인가코드(`?code=`)나 토큰이
 * 실릴 수 있다. 나머지는 화면 이름·id·개수 계열이라 그대로 보낸다.
 * (상품 검색어는 개인정보가 아니고 어떤 검색어에서 실패했는지가 진단에 쓰이므로 유지)
 */
const toBreadcrumbData = (
  eventParams: Record<string, AnalyticsParamValue>
): Record<string, AnalyticsParamValue> => {
  const pagePath = eventParams['page_path'];
  if (typeof pagePath !== 'string') return eventParams;

  return { ...eventParams, page_path: redactUrl(pagePath) };
};

/**
 * GA4 이벤트 전송
 *
 * - `VITE_ENABLE_FIREBASE_ANALYTICS=true` → Firebase Analytics 전송
 * - `false` → 콘솔 로그만 (로컬 개발용)
 *
 * Firebase 전송·콘솔 로그 모두 호출부 params만 사용 (Parameter.csv 스펙 준수).
 */
export const trackEvent = (
  eventName: GaEventName,
  params?: TrackEventParams
): void => {
  const eventParams = buildEventParams(params);

  // GA 이벤트를 Sentry breadcrumb으로도 남긴다.
  // 에러 직전에 사용자가 어느 화면에서 무엇을 선택했는지 재구성하는 유일한 수단이다.
  // (Sentry 기본 breadcrumb은 vanilla-extract 클래스명·원시 경로만 담아 화면을 특정할 수 없다)
  //
  // 아래 early return보다 위에 두는 이유 — GA가 꺼져 있거나 Firebase 초기화가 실패한 환경에서도 breadcrumb은 쌓여야 하므로(정작 그때가 관측이 가장 필요한 순간)
  addReportBreadcrumb({
    category: 'ga',
    message: eventName,
    level: 'info',
    data: toBreadcrumbData(eventParams),
  });

  if (!isAnalyticsEnabled) {
    console.info('[Analytics]', eventName, params);
    return;
  }

  if (!analytics) {
    console.warn('[Analytics] analytics 인스턴스가 초기화되지 않았습니다.');
    return;
  }

  try {
    logEvent(analytics, eventName, eventParams);
  } catch (error) {
    console.error('[Analytics] trackEvent error:', error);
  }
};

/**
 * `screen_name` 포함 trackEvent 후 기존 핸들러 실행
 *
 * @example
 * onClick={trackCallback(GA_EVENTS.component.TOP_NAV_LOGIN_CLICK, 'topNav', onLoginClick)}
 */
export const trackCallback = (
  eventName: GaEventName,
  screenName: string,
  callback?: () => void,
  params?: Omit<TrackEventParams, 'screen_name'>
) => {
  return () => {
    trackEvent(eventName, { screen_name: screenName, ...params });
    callback?.();
  };
};
