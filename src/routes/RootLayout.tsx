import { OverlayProvider } from 'overlay-kit';
import { Outlet } from 'react-router-dom';

import { useGenerateWarmup } from '@pages/generate/hooks/useGenerateWarmup';

import { useScreenNavigation } from '@shared/analytics/hooks';
import { useClaritySync } from '@shared/hooks/useClaritySync';
import { useScrollToTop } from '@shared/hooks/useScrollToTop';
import { useSentrySync } from '@shared/hooks/useSentrySync';

import * as styles from './RootLayout.css';

function RootLayout() {
  // 라우트/쿼리/해시/키 변화와 초기 마운트 시 스크롤 최상단으로 이동
  useScrollToTop();
  useGenerateWarmup();
  useScreenNavigation();
  useClaritySync();
  useSentrySync();

  return (
    <OverlayProvider>
      <div className={styles.container}>
        <Outlet />
      </div>
    </OverlayProvider>
  );
}

export default RootLayout;
