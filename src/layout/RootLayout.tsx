import { Outlet } from 'react-router-dom';
import ScrollToTop from '@/shared/components/ScrollToTop';

function RootLayout() {
  return (
    <div>
      <ScrollToTop />
      <Outlet />
    </div>
  );
}

export default RootLayout;
