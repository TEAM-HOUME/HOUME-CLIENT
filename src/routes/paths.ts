export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  ONBOARDING: '/onboarding',
  GENERATE: '/generate',
  MYPAGE: '/mypage',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
