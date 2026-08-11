export const API_ENDPOINT = {
  AUTH: {
    KAKAO_AUTH: '/oauth/kakao',
    KAKAO_CALLBACK: '/oauth/kakao/callback',
    LOGOUT: '/logout',
    REISSUE: '/reissue',
  },
  USER: {
    SIGN_UP_V2: '/api/v2/sign-up',
    MYPAGE: '/api/v1/mypage/user',
    MYPAGE_IMAGES_V2: '/api/v2/mypage/images',
    DELETE: '/api/v1/user',
    ROTATE_NICKNAME: '/api/v2/nickname/rotate',
    MYPAGE_PROFILE: '/api/v2/mypage/user',
    MYPAGE_PROFILE_EDIT: '/api/v2/mypage/user',
  },
  BANNER: {
    LANDING: '/api/v1/landings',
    BANNER_EXPLORE: (bannerId: number) => `/api/v1/banners/${bannerId}`,
    BANNER_DETAIL: (bannerId: number) => `/api/v1/banners/${bannerId}/detail`,
  },
  IMAGE_SETUP: {
    HOUSE_TEMPLATES: '/api/v2/house-templates', // GET 도면 전체 조회 (필터/페이지네이션)
    HOUSE_TEMPLATE_DETAIL: (floorPlanId: number) =>
      `/api/v2/house-templates/${floorPlanId}`, // GET 도면 상세 조회 (다중 뷰)
    RECENT_FLOOR_PLAN: '/api/v2/recent-floor-plan', // GET 최근 사용한 도면 조회 (RecentSheet용)
    INTERIOR_STYLE: '/api/v1/moodboard-images', // GET 무드보드 제공
    ACTIVITIES: '/api/v2/dashboard/activities', // GET 주요활동 + 활동별 필수 가구
    FURNITURE_CATEGORIES: '/api/v2/dashboard/categories', // GET 가구 카테고리 + 카테고리별 가구
  },
  GENERATE: {
    CAROUSELS_V2: '/api/v2/carousels',
    CAROUSELS_LIKE_V2: '/api/v2/carousels/like',
    IMAGE_V4: '/api/v4/generated-images/generate', // 풀퍼널 이미지 생성
    SIMILAR_ITEMS: (imageId: number) =>
      `/api/v1/generated-images/list-result/${imageId}/similar-items`,
    RELATED_IMAGES: (imageId: number) =>
      `/api/v1/generated-images/list-result/${imageId}/related-images`,
    LIST_RESULT_ITEMS: (imageId: number) =>
      `/api/v1/generated-images/list-result/${imageId}/items`,
    IMAGE_BANNER: '/api/v1/generated-images/generate/banner', // 경로2 배너 진입 이미지 생성
    IMAGE_OTHER_STYLE: '/api/v1/generated-images/generate/other-style', // 경로4 다른 스타일 진입 이미지 생성
    IMAGE_PRODUCT: '/api/v1/generated-images/generate/products', // 경로5 상품 선택 진입 이미지 생성
    IMAGE_META: (imageId: number) => `/api/v1/generated-images/${imageId}/meta`, // 생성 이미지 메타 조회 (imageId/imageUrl/isMirror)
    IMAGE_PREFERENCE: (imageId: number) =>
      `/api/v1/generated-images/${imageId}/preference`,
    FACTORS: '/api/v1/factors',
    FACTOR_PREFERENCE: (imageId: number, factorId: number) =>
      `/api/v1/generated-images/${imageId}/preference/factors/${factorId}`,
    CURATION_CATEGORIES: (imageId: number) =>
      `/api/v1/generated-images/${imageId}/curations/categories`, // ONNX 객체 인식 큐레이션 — 복구 파일 useGeneratedCategoriesQuery가 사용
    CURATION_CATEGORIES_V2: (imageId: number) =>
      `/api/v2/generated-images/${imageId}/curations/categories`, // b-2 추천형 (객체 인식 X)
    CURATION_PRODUCTS: (imageId: number, categoryId: number) =>
      `/api/v1/generated-images/${imageId}/curations/products/${categoryId}`,
    JJYM_V2: (rawProductId: number) =>
      `/api/v2/curation-raw-products/${rawProductId}/jjym`, // 찜하기 토글
    MYPAGE_JJYM_LIST_V2: '/api/v2/jjyms', // 찜한 가구 조회
  },
  PRODUCT: {
    LIST: '/api/v2/curations/products',
    DETAIL: (productId: number) => `/api/v1/curations/products/${productId}`,
    FILTERS: '/api/v1/curations/products/filters',
  },
  STYLES: {
    STYLE_LIST: '/api/v1/other-styles',
    STYLE_DETAIL: (styleId: number) => `/api/v1/other-styles/${styleId}`,
  },
} as const;
