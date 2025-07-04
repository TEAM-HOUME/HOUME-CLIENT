import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from './paths';
import RootLayout from '../layout/RootLayout';
import HomePage from '../pages/home/HomePage';
import LoginPage from '../pages/login/LoginPage';
import SignupPage from '../pages/signup/SignupPage';
import OnboardingPage from '../pages/onboarding/OnboardingPage';
import GeneratePage from '../pages/generate/GeneratePage';
import MyPage from '../pages/mypage/MyPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
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
        path: ROUTES.ONBOARDING,
        element: <OnboardingPage />,
      },
      {
        path: ROUTES.GENERATE,
        element: <GeneratePage />,
      },
      {
        path: ROUTES.MYPAGE,
        element: <MyPage />,
      },
    ],
  },
]);
