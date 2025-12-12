import { useEffect } from 'react';

import { Outlet, useLocation } from 'react-router-dom';

import { ROUTES } from '@/routes/paths';
import { useScrollToTop } from '@/shared/hooks/useScrollToTop';

import { OBJ365_MODEL_PATH } from '@pages/generate/constants/detection';
import { preloadONNXModel } from '@pages/generate/hooks/useOnnxModel';

const GENERATE_WARMUP_PATHS = [
  ROUTES.GENERATE,
  ROUTES.GENERATE_RESULT,
  ROUTES.GENERATE_START,
  ROUTES.IMAGE_SETUP,
];

function RootLayout() {
  // 라우트/쿼리/해시/키 변화와 초기 마운트 시 스크롤 최상단으로 이동
  useScrollToTop();
  useGenerateWarmup();
  return (
    <div>
      <Outlet />
    </div>
  );
}

function useGenerateWarmup() {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    const shouldWarmup = GENERATE_WARMUP_PATHS.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

    if (!shouldWarmup) return;

    preloadONNXModel(OBJ365_MODEL_PATH).catch(() => undefined);
  }, [location.pathname]);
}

export default RootLayout;
