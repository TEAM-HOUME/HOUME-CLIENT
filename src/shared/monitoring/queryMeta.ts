import type { ApiCaptureMode } from './apiReportPolicy';
import type { MonitoringScope } from './scope';

/**
 * query/mutation 단위 Sentry 정책 선언
 *
 * 훅 옵션에 `meta: { sentry: { ... } }`로 붙이면 전역 에러 핸들러가 읽어 적용한다.
 * 캡처 지점은 전역 한 곳으로 유지하면서 도메인별 정책만 선언적으로 조정하기 위한 장치다.
 *
 * @example
 * useMutation({
 *   mutationFn: postGenerateImage,
 *   meta: { sentry: { scope: MONITORING_SCOPE.IMAGE_GENERATE, capture: 'always' } },
 * });
 */
/**
 * interface가 아니라 type으로 선언하는 이유:
 * TanStack의 `Register`는 `Record<string, unknown>`에 할당 가능한 타입만 받아들이는데,
 * interface에는 암묵적 인덱스 시그니처가 없어 증강이 무시된다.
 */
export type SentryQueryMeta = {
  sentry?: {
    /** 이벤트에 붙일 기능 도메인 태그 */
    scope: MonitoringScope;
    /** auto(기본 정책) | always(4xx도 전송) | never(전송 안 함) */
    capture?: ApiCaptureMode;
  };
};

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: SentryQueryMeta;
    mutationMeta: SentryQueryMeta;
  }
}
