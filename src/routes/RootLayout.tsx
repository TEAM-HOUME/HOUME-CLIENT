import { OverlayProvider } from 'overlay-kit';
import { Outlet } from 'react-router-dom';

import { useGenerateWarmup } from '@pages/generate/hooks/useGenerateWarmup';

import { useScreenNavigation } from '@analytics/hooks/useScreenNavigation';

import { useClaritySync } from '@hooks/useClaritySync';
import { useScrollToTop } from '@hooks/useScrollToTop';
import { useSentrySync } from '@hooks/useSentrySync';

import CompareJobWatcher from './CompareJobWatcher';
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
      {/* 진행 중인 가격 비교 job을 어느 화면에서든 지켜보다가 끝나면 토스트로 알린다 */}
      <CompareJobWatcher />
      <div className={styles.container}>
        <Outlet />
      </div>
    </OverlayProvider>
  );
}

export default RootLayout;
