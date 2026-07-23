import { useEffect, useRef } from 'react';

import { RouterProvider } from 'react-router-dom';

import { router } from '@routes/router';

import { TOAST_TYPE, TOASTER_ID } from '@shared/types/toast';

import { useToast } from '@components/v2/toast/useToast';

import { TOAST_ACTION_LABEL, TOAST_MESSAGE } from '@constants/toastMessage';

import { useAppUpdate } from '@hooks/useAppUpdate';

/** setTimeout 최대 지연(약 24.8일). Infinity는 브라우저에서 즉시 만료됨 */
const PERSISTENT_TOAST_DURATION_MS = 2_147_483_647;

function App() {
  const { updateAvailable, latestVersion, reload, dismiss } = useAppUpdate();
  const { notify } = useToast();
  const shownVersionRef = useRef<string | null>(null);
  const isReloadingRef = useRef(false);

  useEffect(() => {
    if (!updateAvailable || !latestVersion) {
      return;
    }

    if (shownVersionRef.current === latestVersion) {
      return;
    }

    shownVersionRef.current = latestVersion;
    isReloadingRef.current = false;

    notify({
      text: TOAST_MESSAGE.APP_UPDATE_AVAILABLE,
      type: TOAST_TYPE.ACTION,
      actionLabel: TOAST_ACTION_LABEL.RELOAD,
      ariaLabel: '지금 새로고침하여 업데이트',
      onClick: () => {
        isReloadingRef.current = true;
        reload();
      },
      options: {
        duration: PERSISTENT_TOAST_DURATION_MS,
        toasterId: TOASTER_ID.BOTTOM_4,
        onDismiss: () => {
          // 스와이프 등으로 닫은 경우에만 세션 dismiss (같은 버전 재알림 방지)
          if (!isReloadingRef.current) {
            dismiss();
          }
          shownVersionRef.current = null;
        },
      },
    });
  }, [updateAvailable, latestVersion, notify, reload, dismiss]);

  return <RouterProvider router={router} />;
}

export default App;
