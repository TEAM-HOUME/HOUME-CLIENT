export const API_ENDPOINT = {
  AUTH: {
    KAKAO_CALLBACK: '/oauth/kakao/callback',
    LOGOUT: '/logout',
    REISSUE: '/reissue',
  },
  USER: {
    SIGN_UP: '/api/v1/sign-up',
    MYPAGE: '/api/v1/mypage/user',
    MYPAGE_IMAGES: '/api/v1/mypage/images',
    MYPAGE_IMAGE_DETAIL: (imageId: number) =>
      `/api/v1/mypage/images/${imageId}`,
  },
  ONBOARDING: {
    HOUSING_SELECTIONS: '/api/v1/housing-selections',
    HOUSE_TEMPLATES: '/api/v1/house-templates',
    MOODBOARD_IMAGES: '/api/v1/moodboard-images',
    ADDRESSES: '/api/v1/addresses',
  },
  GENERATE: {
    CAROUSELS: '/api/v1/carousels',
    CAROUSELS_LIKE: '/api/v1/carousels/like',
    CAROUSELS_HATE: '/api/v1/carousels/hate',
    IMAGE_V2: '/api/v2/generated-images/generate',
    IMAGE_STATUS: '/api/v1/generated-images/generate',
    IMAGE_PREFERENCE: '/api/v1/generated-images',
  },
  ANALYTICS: {
    FURNITURE_LOGS: '/api/v1/furnitures/logs',
    CREDIT_LOGS: '/api/v1/credits/logs',
    CHECK_GENERATED_IMAGE: '/api/v1/check-has-generated-image',
  },
} as const;

// 헬퍼 타입: 중첩된 객체의 모든 리프(leaf) 값들을 추출
export type DeepValues<T> = T extends object
  ? { [K in keyof T]: DeepValues<T[K]> }[keyof T]
  : T;

// 자동으로 모든 엔드포인트 문자열 추출
export type ApiEndpoint = DeepValues<typeof API_ENDPOINT>;
