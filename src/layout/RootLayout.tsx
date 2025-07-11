import { Outlet } from 'react-router';

function RootLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}

export default RootLayout;
