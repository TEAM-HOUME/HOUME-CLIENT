export const API_URL = {
  // AUTH
  AUTH_KAKAO_CALLBACK: '/oauth/kakao/callback',
  AUTH_LOGOUT: '/logout',
  AUTH_REISSUE: '/reissue',

  // USER
  USER_SIGN_UP: '/api/v1/sign-up',
  USER_MYPAGE: '/api/v1/mypage/user',
  USER_MYPAGE_IMAGES: '/api/v1/mypage/images',
  USER_MYPAGE_IMAGE_DETAIL: '/api/v1/mypage/images',

  // ONBOARDING
  ONBOARDING_HOUSING_SELECTIONS: '/api/v1/housing-selections',
  ONBOARDING_HOUSE_TEMPLATES: '/api/v1/house-templates',
  ONBOARDING_MOODBOARD_IMAGES: '/api/v1/moodboard-images',
  ONBOARDING_ADDRESSES: '/api/v1/addresses',

  // GENERATE
  GENERATE_CAROUSELS: '/api/v1/carousels',
  GENERATE_CAROUSELS_LIKE: '/api/v1/carousels/like',
  GENERATE_CAROUSELS_HATE: '/api/v1/carousels/hate',
  GENERATE_IMAGE_V2: '/api/v2/generated-images/generate',
  GENERATE_IMAGE_STATUS: '/api/v1/generated-images/generate',
  GENERATE_IMAGE_PREFERENCE: '/api/v1/generated-images',

  // ANALYTICS
  ANALYTICS_FURNITURE_LOGS: '/api/v1/furnitures/logs',
  ANALYTICS_CREDIT_LOGS: '/api/v1/credits/logs',
  ANALYTICS_CHECK_GENERATED_IMAGE: '/api/v1/check-has-generated-image',
} as const;

export type ApiUrlKeys = keyof typeof API_URL;
export type ApiUrlValues = (typeof API_URL)[ApiUrlKeys];
