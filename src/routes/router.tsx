// ------------------------------
// 앱 라우팅 설정 파일
// ------------------------------
// React Router v6.4(Data Router)의 createBrowserRouter 패턴을 사용하여
// 1) RootLayout       : 모든 페이지의 공통 레이아웃(헤더·푸터) + <Outlet />
// 2) 공개 라우트      : Home, Login, Signup
// 3) ProtectedRoute   : 인증이 필요한 하위 라우트 묶음
//    - 인증 실패 시 ROUTES.LOGIN 으로 리다이렉트
// ------------------------------
import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import RootLayout from '@/layout/RootLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import HomePage from '@/pages/home/HomePage';
import LoginPage from '@/pages/login/LoginPage';
import SignupPage from '@/pages/signup/SignupPage';
import GeneratePage from '@/pages/generate/GeneratePage';
import { ImageSetup } from '@/pages/imageSetup/ImageSetup';
import MyPage from '@/pages/mypage/MyPage';
import KakaoCallback from '@/pages/login/KakaoCallback';
import SignupCompletePage from '@/pages/signup/SignupCompletePage';
import LoadingPage from '@/pages/generate/components/loading/LoadingPage';
import ResultPage from '@/pages/generate/components/result/ResultPage';

// 공개 라우트 그룹 (인증 불필요)
const publicRoutes = [
  {
    // index: true 는 이 라우트 객체가 부모 경로("/")의 인덱스(기본) 경로임을 나타냅니다.
    // 별도의 path 없이 부모 경로 자신에 매칭되며, HomePage 가 루트("/") 요청에 렌더링됩니다.
    index: true,
    element: <HomePage />,
  },
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.SIGNUP,
    element: <SignupPage />,
  },
  {
    path: ROUTES.OAUTH,
    element: <KakaoCallback />,
  },
];

// 보호된 라우트 그룹 (인증 필요)
const protectedRoutes = [
  {
    path: ROUTES.IMAGE_SETUP,
    element: <ImageSetup />,
  },
  {
    path: ROUTES.GENERATE,
    element: <GeneratePage />,
    children: [
      {
        index: true,
        element: <LoadingPage />,
      },
      {
        path: 'result',
        element: <ResultPage />,
      },
    ],
  },
  {
    path: ROUTES.MYPAGE,
    element: <MyPage />,
  },
  {
    path: ROUTES.SIGNUPCOMPLETE,
    element: <SignupCompletePage />,
  },
];

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // 공개 라우트들
      ...publicRoutes,
      // 보호된 라우트들 (ProtectedRoute로 감싸서 인증 체크)
      {
        element: <ProtectedRoute />,
        children: protectedRoutes,
      },
    ],
  },
]);

// 객체 기반(RouteObject) 라우트 정의를 선택한 이유
// -----------------------------------------------------------------------------
// • 배경  : React Router v6.4(2022-09)에서 Remix의 Data APIs가 도입되면서
//           JSX <Route> 트리 대신 JS 객체 배열(RouteObject)을 정적으로 선언하는
//           createBrowserRouter / RouterProvider 패턴이 권장되었습니다.
// • 장점
//   1) 정적 선언 & 빠른 매칭      : 애플리케이션 시작 시 라우트 트리를 한 번에 계산해
//                                  런타임 오버헤드를 줄이고 타입 추론도 용이합니다.
//   2) Data API 통합            : 각 라우트에 loader / action / errorElement 등을
//                                  선언형으로 붙여 데이터 패칭·폼 액션·에러 처리를
//                                  컴포넌트 밖에서 해결할 수 있습니다.
//   3) 코드 스플리팅 용이        : route.lazy 옵션으로 페이지 단위 동적 import가 간단해져
//                                  초기 번들 크기를 줄일 수 있습니다.
//   4) 테스트 & SSR 편의성       : React 트리 없이도 순수 객체만으로 라우트를 주입하거나
//                                  테스트할 수 있고, 서버 사이드에서도 동일한 설정을
//                                  재사용할 수 있습니다.
//   5) 가독성·유지보수           : 중첩 children 배열 구조가 URL 계층과 1:1 매핑되어
//                                  구조 파악이 쉽고 중복되는 <Route> 태그를 제거합니다.
// • 도입 시점
//   - 2022-09 React Router v6.4 정식 릴리스부터 Preview → Stable 단계로 제공되었습니다.
//     (참고: 공식 블로그 "Remixing React Router" (https://remix.run/blog/remixing-react-router))
// -----------------------------------------------------------------------------
