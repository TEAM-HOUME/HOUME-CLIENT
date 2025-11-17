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
    DELETE: '/api/v1/user',
  },
  IMAGE_SETUP: {
    HOUSE_OPTIONS: '/api/v1/housing-options', // GET 집구조 제공(OFFICETEL, VILLA 등)
    HOUSE_INFO: '/api/v1/housing-selections', // POST 집구조 선택
    FLOOR_PLAN: '/api/v1/house-templates', // GET 도면 템플릿 제공
    POST_ADDRESS: '/api/v1/addresses', // POST 사용자 주소 입력받기
    INTERIOR_STYLE: '/api/v1/moodboard-images', // GET 무드보드 제공
    ACTIVITY_OPTIONS: '/api/v1/dashboard-info', // GET 주요활동, 가구 리스트 제공
  },
  GENERATE: {
    CAROUSELS: '/api/v1/carousels',
    CAROUSELS_LIKE: '/api/v1/carousels/like',
    CAROUSELS_HATE: '/api/v1/carousels/hate',
    IMAGE_V2: '/api/v2/generated-images/generate',
    IMAGE_V3: '/api/v3/generated-images/generate',
    IMAGE_STATUS: '/api/v1/generated-images/generate',
    IMAGE_PREFERENCE: '/api/v1/generated-images',
    FACTORS: '/api/v1/factors',
    FACTOR_PREFERENCE: (imageId: number, factorId: number) =>
      `/api/v1/generated-images/${imageId}/preference/factors/${factorId}`,
    CURATION_CATEGORIES: (imageId: number) =>
      `/api/v1/generated-images/${imageId}/curations/categories`,
    CURATION_PRODUCTS: (imageId: number, categoryId: number) =>
      `/api/v1/generated-images/${imageId}/curations/products/${categoryId}`,
    CURATION_DASHBOARD: '/api/v1/dashboard-info',
    JJYM: (recommendFurnitureId: number) =>
      `/api/v1/recommend-furnitures/${recommendFurnitureId}/jjym`, // 찜하기 토글
    MYPAGE_JJYM_LIST: '/api/v1/jjyms', // 찜한 가구 조회
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
