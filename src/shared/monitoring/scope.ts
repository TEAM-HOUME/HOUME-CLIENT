/**
 * 모니터링 이벤트의 기능 도메인 스코프
 *
 * Sentry 이벤트에 `scope` 태그로 붙어 대시보드에서 영역별 필터링에 쓰인다.
 * GA의 `GA_EVENTS`처럼 이 파일이 스코프 이름의 SSOT
 */
export const MONITORING_SCOPE = {
  /** API 요청 실패 — 전역 핸들러가 붙이는 기본값 */
  API: 'api',
  /** 이미지 생성 플로우 */
  IMAGE_GENERATE: 'imageGenerate',
  /** 로그인·토큰 재발급 등 인증 */
  AUTH: 'auth',
  /** 이미지 에셋 로드 폴백 */
  IMAGE_ASSET: 'imageAsset',
  /** 인라인 에러 등 폴백 UI 노출 */
  UI_FALLBACK: 'uiFallback',
  /** GA·Clarity 등 계측 도구 자체의 실패 */
  ANALYTICS: 'analytics',
} as const;

export type MonitoringScope =
  (typeof MONITORING_SCOPE)[keyof typeof MONITORING_SCOPE];
