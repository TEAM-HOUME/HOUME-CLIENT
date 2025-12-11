// 가구 큐레이션 전용 React Query 훅 정의
import { useEffect, useMemo } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEY } from '@/shared/constants/queryKey';

import {
  getFurnitureDashboardInfo,
  getGeneratedImageCategories,
  getGeneratedImageProducts,
} from '@pages/generate/apis/furniture';
import { useCurationCacheStore } from '@pages/generate/stores/useCurationCacheStore';
import {
  useCurationStore,
  selectActiveImageState,
  type CurationSnapState,
} from '@pages/generate/stores/useCurationStore';

import type { FurnitureCategoryCode } from '@pages/generate/constants/furnitureCategoryMapping';
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
export const useGeneratedCategoriesQuery = (
  groupId: number | null,
  imageId: number | null
) => {
  const selectCategory = useCurationStore((state) => state.selectCategory);
  const imageState = useCurationStore((state) =>
    imageId !== null ? (state.images[imageId] ?? null) : null
  );
  const detectedObjects = useMemo<FurnitureCategoryCode[]>(
    () => imageState?.detectedObjects ?? [],
    [imageState?.detectedObjects]
  );
  const selectedCategoryId = imageState?.selectedCategoryId ?? null;

  const normalizedDetectedObjects = useMemo<FurnitureCategoryCode[]>(
    () => Array.from(new Set(detectedObjects)),
    [detectedObjects]
  );
  const detectionSignature = useMemo(
    () => normalizedDetectedObjects.slice().sort().join(','),
    [normalizedDetectedObjects]
  );

  const groupCategoriesEntry = useCurationCacheStore((state) =>
    groupId ? (state.groups[groupId]?.categories ?? null) : null
  );
  const cachedCodeSet = useMemo(
    () =>
      groupCategoriesEntry
        ? new Set(groupCategoriesEntry.detectedObjects)
        : null,
    [groupCategoriesEntry]
  );
  const shouldSkipFetchWithCache =
    Boolean(groupId) &&
    Boolean(groupCategoriesEntry) &&
    cachedCodeSet !== null &&
    normalizedDetectedObjects.every((code) => cachedCodeSet.has(code));

  const query = useQuery<FurnitureCategoriesResponse>({
    // queryKey에 이미지/감지값 전체를 직접 포함해 의존성 유지
    queryKey: [
      groupId
        ? QUERY_KEY.GENERATE_FURNITURE_CATEGORIES_GROUP
        : QUERY_KEY.GENERATE_FURNITURE_CATEGORIES,
      groupId ?? imageId,
      imageId,
      detectionSignature,
      normalizedDetectedObjects,
      detectedObjects,
    ],
    queryFn: () =>
      getGeneratedImageCategories(imageId!, normalizedDetectedObjects),
    enabled:
      Boolean(imageId) &&
      normalizedDetectedObjects.length > 0 &&
      !shouldSkipFetchWithCache,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    initialData:
      groupId && groupCategoriesEntry
        ? () => groupCategoriesEntry.response
        : undefined,
    onSuccess: (data) => {
      if (!groupId) return;
      const existing =
        useCurationCacheStore.getState().groups[groupId]?.categories;
      if (
        existing &&
        existing.detectionSignature === detectionSignature &&
        existing.response === data
      ) {
        return;
      }
      useCurationCacheStore.getState().saveCategories({
        groupId,
        response: data,
        detectedObjects: normalizedDetectedObjects,
        detectionSignature,
      });
    },
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

export const useGeneratedProductsQuery = (
  groupId: number | null,
  imageId: number | null,
  categoryId: number | null
) => {
  const productCacheEntry = useCurationCacheStore((state) =>
    groupId && categoryId
      ? (state.groups[groupId]?.products[categoryId] ?? null)
      : null
  );

  const shouldSkipFetchWithCache =
    Boolean(groupId) && Boolean(productCacheEntry);

  const query = useQuery<FurnitureProductsInfoResponse>({
    // queryKey에 그룹/이미지/카테고리 식별자를 직접 배치
    queryKey: [
      groupId
        ? QUERY_KEY.GENERATE_FURNITURE_PRODUCTS_GROUP
        : QUERY_KEY.GENERATE_FURNITURE_PRODUCTS,
      groupId ?? imageId,
      imageId,
      categoryId,
    ],
    queryFn: () => getGeneratedImageProducts(imageId!, categoryId!),
    enabled:
      Boolean(imageId) && Boolean(categoryId) && !shouldSkipFetchWithCache,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    initialData:
      groupId && productCacheEntry
        ? () => productCacheEntry.response
        : undefined,
    onSuccess: (data) => {
      if (!groupId || !categoryId) return;
      const existing =
        useCurationCacheStore.getState().groups[groupId]?.products[categoryId];
      if (existing?.response === data) {
        return;
      }
      useCurationCacheStore.getState().saveProducts({
        groupId,
        categoryId,
        response: data,
      });
    },
  });

  return query;
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
  const clearGroupCategories = useCurationCacheStore(
    (state) => state.clearGroupCategories
  );
  const clearGroupProduct = useCurationCacheStore(
    (state) => state.clearGroupProduct
  );
  return useMemo(
    () => ({
      invalidateCategories: (
        groupId: number | null,
        imageId: number | null
      ) => {
        if (groupId) {
          clearGroupCategories(groupId);
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEY.GENERATE_FURNITURE_CATEGORIES_GROUP, groupId],
          });
        } else {
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEY.GENERATE_FURNITURE_CATEGORIES, imageId],
          });
        }
      },
      invalidateProducts: (
        groupId: number | null,
        imageId: number | null,
        categoryId?: number | null
      ) => {
        if (groupId && categoryId) {
          clearGroupProduct(groupId, categoryId);
        }
        queryClient.invalidateQueries({
          queryKey: groupId
            ? [QUERY_KEY.GENERATE_FURNITURE_PRODUCTS_GROUP, groupId, categoryId]
            : [QUERY_KEY.GENERATE_FURNITURE_PRODUCTS, imageId, categoryId],
        });
      },
    }),
    [clearGroupCategories, clearGroupProduct, queryClient]
  );
};

// 스냅 상태를 직접 설정하는 헬퍼 정의
export const useOpenCurationSheet = () => {
  const { setSnapState } = useSheetSnapState();
  return (next: CurationSnapState) => {
    setSnapState(next);
  };
};
