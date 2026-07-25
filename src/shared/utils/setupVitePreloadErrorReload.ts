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
    const reloadKey = getPreloadReloadedStorageKey();

    try {
      if (sessionStorage.getItem(reloadKey)) {
        // 이미 1회 reload 한 빌드 → preventDefault 하지 않아 원본 에러가 라우터/에러 UI로 전달됨
        return;
      }
      sessionStorage.setItem(reloadKey, 'true');
    } catch {
      // 가드를 남길 수 없으면 자동 reload하지 않음 (무한 새로고침 방지)
      return;
    }

    event.preventDefault();
    window.location.reload();
  });
}
