// 생성 이미지 큐레이션 API 모음
import { HTTPMethod, request } from '@/shared/apis/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';

import type { FurnitureCategoryCode } from '@pages/generate/constants/furnitureCategoryMapping';
import type {
  FurnitureAndActivityResponse,
  FurnitureCategoriesResponse,
  FurnitureProductsInfoResponse,
} from '@pages/generate/types/furniture';

// 생성 이미지 카테고리 조회 API 호출
export const getGeneratedImageCategories = async (
  imageId: number,
  detectedObjects: FurnitureCategoryCode[]
) => {
  return request<FurnitureCategoriesResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.GENERATE.CURATION_CATEGORIES(imageId),
    query: { detectedObjects },
  });
};

// 생성 이미지 카테고리별 상품 조회 API 호출
export const getGeneratedImageProducts = async (
  imageId: number,
  categoryId: number
) => {
  return request<FurnitureProductsInfoResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.GENERATE.CURATION_PRODUCTS(imageId, categoryId),
  });
};

// 대시보드 활동 및 가구 목록 조회 API 호출
export const getFurnitureDashboardInfo = async () => {
  return request<FurnitureAndActivityResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.GENERATE.CURATION_DASHBOARD,
  });
};
