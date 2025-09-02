// 라우트 가드 컴포넌트
// - isAuthenticated: 인증 여부를 boolean 으로 전달
// - redirectTo: 인증되지 않았을 때 이동할 경로(기본값: 로그인 페이지)
//
// createBrowserRouter 객체 트리에서 중간 노드로 사용해
// 하위(children) 라우트를 한 번에 보호할 수 있습니다.
import { Navigate, Outlet } from 'react-router-dom';

import { ROUTES } from '@/routes/paths';
import { useUserSync } from '@/shared/hooks/useUserSync';

interface ProtectedRouteProps {
  isAuthenticated?: boolean; // 인증 여부(외부에서 전달 가능, 없으면 내부에서 accessToken으로 판단)
  redirectTo?: string; // 인증 실패 시 이동할 경로
}

function ProtectedRoute({
  isAuthenticated,
  redirectTo = ROUTES.LOGIN,
}: ProtectedRouteProps) {
  // 사용자 정보 동기화 및 로그인 상태 확인
  const { isLoggedIn } = useUserSync();

  // 인증 여부: prop이 있으면 우선 사용, 없으면 useUserSync에서 가져온 로그인 상태로 판단
  const authenticated = isAuthenticated ?? isLoggedIn;

  // 인증되지 않은 경우 즉시 리다이렉트
  if (!authenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // 인증된 경우 자식 라우트(<Outlet />)를 렌더링
  return <Outlet />;
}

export default ProtectedRoute;
