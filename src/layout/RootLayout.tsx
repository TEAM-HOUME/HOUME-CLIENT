import { Outlet } from 'react-router-dom';
import { useScrollToTop } from '@/shared/hooks/useScrollToTop';

function RootLayout() {
  useScrollToTop({ includeHash: false, includeKey: false });
  return (
    <div>
      <Outlet />
    </div>
  );
}

export default RootLayout;
