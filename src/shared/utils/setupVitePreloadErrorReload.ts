import { getPreloadReloadedStorageKey } from '@constants/appUpdate';

/**
 * 새 배포로 이전 chunk가 사라져 동적 import가 실패할 때,
 * 현재 빌드당 한 번만 전체 새로고침합니다.
 * @see https://vitejs.dev/guide/build.html#load-error-handling
 */
export function setupVitePreloadErrorReload(
  enabled: boolean = import.meta.env.PROD
) {
  if (!enabled) {
    return;
  }

  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();

    const reloadKey = getPreloadReloadedStorageKey();

    try {
      if (sessionStorage.getItem(reloadKey)) {
        return;
      }
      sessionStorage.setItem(reloadKey, 'true');
    } catch {
      // sessionStorage 사용 불가 시에도 1회 reload는 시도
    }

    window.location.reload();
  });
}
