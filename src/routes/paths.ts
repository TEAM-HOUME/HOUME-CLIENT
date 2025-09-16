// 전역에서 사용하는 "경로 상수" 모음입니다.
// 해당 상수를 직접 사용함으로써 문자열 오타나 중복을 방지하고,
// 값 유니온 타입(RoutePath)을 자동으로 얻어 타입 안전성을 확보할 수 있습니다.
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  SIGNUPCOMPLETE: '/signup/complete',
  IMAGE_SETUP: '/imageSetup',
  GENERATE: '/generate',
  MYPAGE: '/mypage',
  SETTING: '/mypage/setting',
  OAUTH: '/oauth/kakao/callback',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
