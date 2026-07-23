import { useCallback, useEffect, useState } from 'react';

import {
  APP_UPDATE_CHECK_INTERVAL_MS,
  APP_UPDATE_STORAGE_KEYS,
  CLIENT_BUILD_ID,
} from '@constants/appUpdate';

interface VersionResponse {
  version: string;
  builtAt?: string;
}

interface UseAppUpdateOptions {
  /** 기본 5분 */
  intervalMs?: number;
  /**
   * 버전 검사 활성화 여부.
   * 기본값은 프로덕션(`import.meta.env.PROD`)입니다.
   */
  enabled?: boolean;
}

/**
 * 프로덕션에서 /version.json 을 확인해 새 배포 여부를 알립니다.
 * 자동 새로고침은 하지 않고, 호출측에서 토스트 등으로 안내합니다.
 */
export function useAppUpdate({
  intervalMs = APP_UPDATE_CHECK_INTERVAL_MS,
  enabled = import.meta.env.PROD,
}: UseAppUpdateOptions = {}) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [latestVersion, setLatestVersion] = useState<string>();

  const reload = useCallback(() => {
    window.location.reload();
  }, []);

  const dismiss = useCallback(() => {
    if (latestVersion) {
      try {
        sessionStorage.setItem(
          APP_UPDATE_STORAGE_KEYS.dismissedVersion,
          latestVersion
        );
      } catch {
        // sessionStorage 실패 시에도 UI만 닫음
      }
    }
    setUpdateAvailable(false);
  }, [latestVersion]);

  const checkForUpdate = useCallback(async () => {
    if (!enabled) {
      return;
    }

    try {
      const versionUrl = `${import.meta.env.BASE_URL}version.json?t=${Date.now()}`;
      const response = await fetch(versionUrl, {
        cache: 'no-store',
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as VersionResponse;

      if (!data.version || data.version === CLIENT_BUILD_ID) {
        return;
      }

      let dismissedVersion: string | null = null;
      try {
        dismissedVersion = sessionStorage.getItem(
          APP_UPDATE_STORAGE_KEYS.dismissedVersion
        );
      } catch {
        dismissedVersion = null;
      }

      if (data.version === dismissedVersion) {
        return;
      }

      setLatestVersion(data.version);
      setUpdateAvailable(true);
    } catch {
      // 일시적 네트워크 오류는 업데이트 없음으로 처리
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void checkForUpdate();

    const intervalId = window.setInterval(checkForUpdate, intervalMs);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void checkForUpdate();
      }
    };

    const handleOnline = () => {
      void checkForUpdate();
    };

    const handleFocus = () => {
      void checkForUpdate();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkForUpdate, enabled, intervalMs]);

  return {
    currentVersion: CLIENT_BUILD_ID,
    latestVersion,
    updateAvailable,
    reload,
    dismiss,
  };
}
