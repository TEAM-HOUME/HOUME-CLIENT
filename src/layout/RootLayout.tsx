import { Outlet } from 'react-router-dom';

import { useScrollToTop } from '@/shared/hooks/useScrollToTop';

function RootLayout() {
  // 라우트/쿼리/해시/키 변화와 초기 마운트 시 스크롤 최상단으로 이동
  useScrollToTop();
  return (
    <div>
      <Outlet />
    </div>
  );
}

export default RootLayout;
