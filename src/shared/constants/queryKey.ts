import type { FurnitureCategoryCode } from '@shared/detection/furnitureCategoryMapping';

// Furniture Query Variables
export interface CategoriesQueryVariables {
  groupId: number | null;
  imageId: number | null;
  detectionSignature: string;
  codes: FurnitureCategoryCode[];
}

export interface ProductsQueryVariables {
  groupId: number | null;
  imageId: number | null;
  categoryId: number | null;
}

export interface ProductListQueryVariables {
  keyword?: string;
  types?: number[];
  priceRanges?: string[];
  colors?: number[];
  cursor?: number;
  size?: number;
}

// Query Key Factory
export const queryKeys = {
  // 랜딩
  landing: {
    all: ['landing'] as const,
    history: () => [...queryKeys.landing.all, 'history'] as const,
  },

  // 상품
  product: {
    all: ['product'] as const,
    productFilters: () => [...queryKeys.product.all, 'productFilters'] as const,
    productList: (params: Omit<ProductListQueryVariables, 'cursor'>) =>
      [...queryKeys.product.all, 'productList', params] as const,
    productDetail: (id: number) =>
      [...queryKeys.product.all, 'productDetail', id] as const,
  },

  // 배너
  banner: {
    all: ['banner'] as const,
    list: (bannerId: number) =>
      [...queryKeys.banner.all, 'list', bannerId] as const,
    detail: (bannerId: number) =>
      [...queryKeys.banner.all, 'detail', bannerId] as const,
  },

  // 이미지 설정 (온보딩 퍼널)
  imageSetup: {
    all: ['imageSetup'] as const,
    houseTemplates: (params: {
      size?: number;
      residenceType?: string[];
      layoutType?: string[];
      equilibrium?: string[];
    }) => [...queryKeys.imageSetup.all, 'houseTemplates', params] as const,
    houseTemplateDetail: (floorPlanId: number) =>
      [
        ...queryKeys.imageSetup.all,
        'houseTemplateDetail',
        floorPlanId,
      ] as const,
    recentFloorPlan: () =>
      [...queryKeys.imageSetup.all, 'recentFloorPlan'] as const,
    activities: () => [...queryKeys.imageSetup.all, 'activities'] as const,
    furnitureCategories: () =>
      [...queryKeys.imageSetup.all, 'furnitureCategories'] as const,
    moodBoard: (limit?: number) =>
      [...queryKeys.imageSetup.all, 'moodBoard', limit] as const,
  },

  // 이미지 생성
  generate: {
    all: ['generate'] as const,
    stack: (param?: number | number[]) =>
      [...queryKeys.generate.all, 'stack', param ?? 'initial'] as const,
    meta: (imageId: number) =>
      [...queryKeys.generate.all, 'meta', imageId] as const,
    result: (houseId: number) =>
      [...queryKeys.generate.all, 'result', houseId] as const,
    fallback: (houseId: number) =>
      [...queryKeys.generate.all, 'fallback', houseId] as const,
    factors: (isLike: boolean) =>
      [...queryKeys.generate.all, 'factors', isLike] as const,
    image: () => [...queryKeys.generate.all, 'image'] as const,
    listResultItems: (imageId: number) =>
      [...queryKeys.generate.all, 'listResultItems', imageId] as const,
    similarItems: (imageId: number) =>
      [...queryKeys.generate.all, 'similarItems', imageId] as const,
    relatedImages: (imageId: number) =>
      [...queryKeys.generate.all, 'relatedImages', imageId] as const,
    curationCategories: (imageId: number) =>
      [...queryKeys.generate.all, 'curationCategories', imageId] as const,
    curationProducts: (imageId: number, categoryId: number) =>
      [
        ...queryKeys.generate.all,
        'curationProducts',
        imageId,
        categoryId,
      ] as const,
  },

  // 가구 큐레이션
  furniture: {
    all: ['furniture'] as const,
    dashboard: () => [...queryKeys.furniture.all, 'dashboard'] as const,
    categoriesGroup: (vars: CategoriesQueryVariables) =>
      [...queryKeys.furniture.all, 'categoriesGroup', vars] as const,
    categories: (vars: CategoriesQueryVariables) =>
      [...queryKeys.furniture.all, 'categories', vars] as const,
    productsGroup: (vars: ProductsQueryVariables) =>
      [...queryKeys.furniture.all, 'productsGroup', vars] as const,
    products: (vars: ProductsQueryVariables) =>
      [...queryKeys.furniture.all, 'products', vars] as const,
  },

  // 마이페이지
  mypage: {
    all: ['mypage'] as const,
    user: () => [...queryKeys.mypage.all, 'user'] as const,
    profile: () => [...queryKeys.mypage.all, 'profile'] as const,
    images: () => [...queryKeys.mypage.all, 'images'] as const,
    imageDetail: (houseId: number) =>
      [...queryKeys.mypage.all, 'imageDetail', houseId] as const,
    jjymList: () => [...queryKeys.mypage.all, 'jjym', 'list'] as const,
  },

  // 스타일
  styles: {
    all: ['styles'] as const,
    list: (size?: number) => [...queryKeys.styles.all, 'list', size] as const,
    detail: (styleId: number) =>
      [...queryKeys.styles.all, 'detail', styleId] as const,
  },

  // 회원가입: 랜덤 닉네임
  signup: {
    all: ['signup'] as const,
    randomNickname: () => [...queryKeys.signup.all, 'randomNickname'] as const,
  },
} as const;
