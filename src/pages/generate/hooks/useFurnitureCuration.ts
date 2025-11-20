// 가구 큐레이션 전용 React Query 훅 정의
import { useEffect, useMemo } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEY } from '@/shared/constants/queryKey';

import {
  getFurnitureDashboardInfo,
  getGeneratedImageCategories,
  getGeneratedImageProducts,
} from '@pages/generate/apis/furniture';
import {
  useCurationStore,
  selectActiveImageState,
  type CurationSnapState,
} from '@pages/generate/stores/useCurationStore';

import type {
  FurnitureAndActivityResponse,
  FurnitureCategoriesResponse,
  FurnitureProductsInfoResponse,
} from '@pages/generate/types/furniture';

// 대시보드 정보 조회 훅 정의
export const useFurnitureDashboardQuery = () => {
  return useQuery<FurnitureAndActivityResponse>({
    queryKey: [QUERY_KEY.GENERATE_FURNITURE_DASHBOARD],
    queryFn: getFurnitureDashboardInfo,
    staleTime: 5 * 60 * 1000,
  });
};

// 활성 이미지 ID 선택 훅 정의
export const useActiveImageId = () =>
  useCurationStore((state) => state.activeImageId);

// 활성 이미지에 대한 카테고리 쿼리 훅 정의
export const useGeneratedCategoriesQuery = (imageId: number | null) => {
  const selectCategory = useCurationStore((state) => state.selectCategory);
  const imageState = useCurationStore((state) =>
    imageId !== null ? (state.images[imageId] ?? null) : null
  );

  const detectedObjects = imageState?.detectedObjects ?? [];
  const selectedCategoryId = imageState?.selectedCategoryId ?? null;

  const query = useQuery<FurnitureCategoriesResponse>({
    queryKey: [
      QUERY_KEY.GENERATE_FURNITURE_CATEGORIES,
      imageId,
      detectedObjects,
    ],
    queryFn: () => getGeneratedImageCategories(imageId!, detectedObjects),
    enabled: Boolean(imageId) && detectedObjects.length > 0,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    // 카테고리 자동 선택 제거
    // - 기본값은 선택 해제 상태 유지
    // - 현재 선택이 더 이상 유효하지 않다면 null 로 초기화
    if (!imageId) return;
    if (!query.data) {
      if (selectedCategoryId !== null) selectCategory(imageId, null);
      return;
    }
    const categories = query.data.categories ?? [];
    if (categories.length === 0) {
      if (selectedCategoryId !== null) selectCategory(imageId, null);
      return;
    }
    const exists = categories.some((item) => item.id === selectedCategoryId);
    if (!exists && selectedCategoryId !== null) {
      // 이전 선택이 유효하지 않으면 선택 해제
      selectCategory(imageId, null);
    }
    // 자동으로 첫 카테고리를 선택하지 않음
  }, [imageId, query.data, selectCategory, selectedCategoryId]);

  return query;
};

// 활성 이미지의 추천 상품 쿼리 훅 정의
export const useGeneratedProductsQuery = (
  imageId: number | null,
  categoryId: number | null
) => {
  return useQuery<FurnitureProductsInfoResponse>({
    queryKey: [QUERY_KEY.GENERATE_FURNITURE_PRODUCTS, imageId, categoryId],
    queryFn: () => getGeneratedImageProducts(imageId!, categoryId!),
    enabled: Boolean(imageId) && Boolean(categoryId),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// 활성 이미지 상태 선택 훅 정의
export const useActiveImageCurationState = () =>
  useCurationStore(selectActiveImageState);

// 스냅 상태 제어 훅 정의
export const useSheetSnapState = () => {
  const snapState = useCurationStore((state) => state.sheetSnapState);
  const setSnapState = useCurationStore((state) => state.setSheetSnapState);
  return useMemo(
    () => ({
      snapState,
      setSnapState,
    }),
    [snapState, setSnapState]
  );
};

// 카테고리 쿼리 무효화 유틸 훅 정의
export const useInvalidateCurationQueries = () => {
  const queryClient = useQueryClient();
  return useMemo(
    () => ({
      invalidateCategories: (imageId: number | null) =>
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY.GENERATE_FURNITURE_CATEGORIES, imageId],
        }),
      invalidateProducts: (
        imageId: number | null,
        categoryId?: number | null
      ) =>
        queryClient.invalidateQueries({
          queryKey: [
            QUERY_KEY.GENERATE_FURNITURE_PRODUCTS,
            imageId,
            categoryId,
          ],
        }),
    }),
    [queryClient]
  );
};

// 스냅 상태를 직접 설정하는 헬퍼 정의
export const useOpenCurationSheet = () => {
  const { setSnapState } = useSheetSnapState();
  return (next: CurationSnapState) => {
    setSnapState(next);
  };
};
