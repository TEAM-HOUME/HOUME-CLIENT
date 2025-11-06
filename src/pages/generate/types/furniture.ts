// 생성 이미지 큐레이션 타입 정의 모음

// 생성 이미지 카테고리 응답 항목 정의
export interface FurnitureCategoryResponse {
  id: number;
  categoryName: string;
}

// 생성 이미지 카테고리 응답 래퍼 정의
export interface FurnitureCategoriesResponse {
  categories: FurnitureCategoryResponse[];
}

// 생성 이미지 추천 상품 항목 정의
export interface FurnitureProductInfo {
  baseFurnitureImageUrl: string;
  furnitureProductImageUrl: string;
  furnitureProductSiteUrl: string;
  furnitureProductName: string;
  furnitureProductMallName: string;
  furnitureProductId: string;
  similarity: number;
}

// 생성 이미지 추천 상품 응답 래퍼 정의
export interface FurnitureProductsInfoResponse {
  userName: string;
  products: FurnitureProductInfo[];
}

// 대시보드 활동 항목 정의
export interface FurnitureActivityItem {
  code: string;
  label: string;
}

// 대시보드 가구 항목 정의
export interface FurnitureDashboardItem {
  id: number;
  code: string;
  label: string;
}

// 대시보드 카테고리 그룹 정의
export interface FurnitureCategoryGroup {
  categoryId: number;
  nameKr: string;
  nameEng: string;
  furnitures: FurnitureDashboardItem[];
}

// 대시보드 활동 및 가구 응답 래퍼 정의
export interface FurnitureAndActivityResponse {
  activities: FurnitureActivityItem[];
  categories: FurnitureCategoryGroup[];
}
