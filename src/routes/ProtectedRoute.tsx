// 라우트 가드 컴포넌트
// - isAuthenticated: 인증 여부를 boolean 으로 전달
// - redirectTo: 인증되지 않았을 때 이동할 경로(기본값: 로그인 페이지)
//
// createBrowserRouter 객체 트리에서 중간 노드로 사용해
// 하위(children) 라우트를 한 번에 보호할 수 있습니다.
import { Navigate, Outlet } from 'react-router';
import { ROUTES } from '@/routes/paths';

interface ProtectedRouteProps {
  isAuthenticated?: boolean;
  redirectTo?: string;
}

function ProtectedRoute({
  isAuthenticated = false,
  redirectTo = ROUTES.LOGIN,
}: ProtectedRouteProps) {
  // 인증되지 않은 경우 즉시 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // 인증된 경우 자식 라우트(<Outlet />)를 렌더링
  return <Outlet />;
}

export default ProtectedRoute;
