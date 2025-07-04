import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';

interface ProtectedRouteProps {
  isAuthenticated?: boolean;
  redirectTo?: string;
}

function ProtectedRoute({
  isAuthenticated = false,
  redirectTo = ROUTES.LOGIN,
}: ProtectedRouteProps) {
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
