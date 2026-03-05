// 라우트 가드 컴포넌트
// - isAuthenticated: 인증 여부를 boolean 으로 전달
// - redirectTo: 인증되지 않았을 때 이동할 경로(기본값: 로그인 페이지)
//
// createBrowserRouter 객체 트리에서 중간 노드로 사용해
// 하위(children) 라우트를 한 번에 보호할 수 있습니다.
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { ROUTES } from '@routes/paths';

import { useUserSync } from '@hooks/useUserSync';

import { setLoginRedirect } from '@utils/loginRedirect';

interface ProtectedRouteProps {
  isAuthenticated?: boolean; // 인증 여부(외부에서 전달 가능, 없으면 내부에서 accessToken으로 판단)
  redirectTo?: string; // 인증 실패 시 이동할 경로
}

function ProtectedRoute({
  isAuthenticated,
  redirectTo = ROUTES.LOGIN,
}: ProtectedRouteProps) {
  const location = useLocation();
  const { isLoggedIn } = useUserSync();

  const authenticated = isAuthenticated ?? isLoggedIn;

  // 비인증 상태에서 ProtectedRoute에 접근하면 로그인 페이지로 보내기 전에 현재 URL을 sessionStorage에 저장
  if (!authenticated) {
    // pathname: 경로, search: 쿼리 파라미터 -> 전체경로
    setLoginRedirect(location.pathname + location.search);
    return <Navigate to={redirectTo} replace />;
  }

  // 인증된 경우 자식 라우트(<Outlet />)를 렌더링
  return <Outlet />;
}

export default ProtectedRoute;
