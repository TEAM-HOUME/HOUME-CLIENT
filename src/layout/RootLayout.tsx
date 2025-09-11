import { Outlet } from 'react-router-dom';
import { useScrollToTop } from '@/shared/hooks/useScrollToTop';

function RootLayout() {
  // 기본값 사용: 해시/키 변화에는 반응하지 않음
  useScrollToTop();
  return (
    <div>
      <Outlet />
    </div>
  );
}

export default RootLayout;
