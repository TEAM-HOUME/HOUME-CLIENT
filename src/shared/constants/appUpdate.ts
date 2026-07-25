/** 배포 버전 감지·업데이트 알림용 상수 */

/** 현재 번들에 주입된 배포 빌드 ID (`vite.config` define) */
export const CLIENT_BUILD_ID: string = __BUILD_ID__;

export const APP_UPDATE_CHECK_INTERVAL_MS = 5 * 60 * 1000;

export const APP_UPDATE_STORAGE_KEYS = {
  /** 닫은(스와이프 등) 최신 version.json 값 (세션 단위) */
  DISMISSED_VERSION: 'houme:dismissed-app-version',
  /** vite:preloadError 로 reload 한 빌드 표시 (빌드당 1회) */
  PRELOAD_RELOADED_PREFIX: 'houme:preload-reloaded:',
} as const;

export const getPreloadReloadedStorageKey = (
  buildId: string = CLIENT_BUILD_ID
) => `${APP_UPDATE_STORAGE_KEYS.PRELOAD_RELOADED_PREFIX}${buildId}`;
