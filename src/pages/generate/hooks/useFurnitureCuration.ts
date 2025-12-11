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

interface CategoriesQueryVariables {
  groupId: number | null;
  imageId: number | null;
  detectionSignature: string;
  codes: FurnitureCategoryCode[];
}

type CategoriesQueryKey = readonly [
  (
    | typeof QUERY_KEY.GENERATE_FURNITURE_CATEGORIES_GROUP
    | typeof QUERY_KEY.GENERATE_FURNITURE_CATEGORIES
  ),
  CategoriesQueryVariables,
];

interface ProductsQueryVariables {
  groupId: number | null;
  imageId: number | null;
  categoryId: number | null;
}

type ProductsQueryKey = readonly [
  (
    | typeof QUERY_KEY.GENERATE_FURNITURE_PRODUCTS_GROUP
    | typeof QUERY_KEY.GENERATE_FURNITURE_PRODUCTS
  ),
  ProductsQueryVariables,
];

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
    groupId !== null ? (state.groups[groupId]?.categories ?? null) : null
  );
  const saveGroupCategories = useCurationCacheStore(
    (state) => state.saveCategories
  );
  const canUseGroupInitialData =
    groupId !== null &&
    groupCategoriesEntry !== null &&
    groupCategoriesEntry.detectionSignature === detectionSignature;

  const categoriesQueryKey: CategoriesQueryKey = [
    groupId !== null
      ? QUERY_KEY.GENERATE_FURNITURE_CATEGORIES_GROUP
      : QUERY_KEY.GENERATE_FURNITURE_CATEGORIES,
    {
      groupId,
      imageId,
      detectionSignature,
      codes: normalizedDetectedObjects,
    },
  ];

  const initialCategoriesResponse = canUseGroupInitialData
    ? groupCategoriesEntry!.response
    : undefined;

  const query = useQuery<
    FurnitureCategoriesResponse,
    Error,
    FurnitureCategoriesResponse,
    CategoriesQueryKey
  >({
    // queryKey에 이미지/감지값 전체를 직접 포함해 의존성 유지
    queryKey: categoriesQueryKey,
    queryFn: () =>
      getGeneratedImageCategories(imageId!, normalizedDetectedObjects),
    enabled: Boolean(imageId) && normalizedDetectedObjects.length > 0,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    ...(initialCategoriesResponse
      ? { initialData: initialCategoriesResponse }
      : {}),
  });

  useEffect(() => {
    if (groupId === null) return;
    if (!query.data) return;
    const existing =
      useCurationCacheStore.getState().groups[groupId]?.categories ?? null;
    if (
      existing &&
      existing.detectionSignature === detectionSignature &&
      existing.response === query.data
    ) {
      return;
    }
    saveGroupCategories({
      groupId,
      response: query.data,
      detectedObjects: normalizedDetectedObjects,
      detectionSignature,
    });
  }, [
    groupId,
    query.data,
    detectionSignature,
    normalizedDetectedObjects,
    saveGroupCategories,
  ]);

  useEffect(() => {
    // 카테고리 자동 선택 제거
    // - 기본값은 선택 해제 상태 유지
    // - 현재 선택이 더 이상 유효하지 않다면 null 로 초기화
    if (!imageId) return;
    if (!query.data) {
      if (selectedCategoryId !== null) selectCategory(imageId, null);
      return;
    }
    const categories: FurnitureCategoriesResponse['categories'] =
      query.data?.categories ?? [];
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
    groupId !== null && categoryId !== null
      ? (state.groups[groupId]?.products[categoryId] ?? null)
      : null
  );
  const saveGroupProducts = useCurationCacheStore(
    (state) => state.saveProducts
  );

  const productsQueryKey: ProductsQueryKey = [
    groupId !== null
      ? QUERY_KEY.GENERATE_FURNITURE_PRODUCTS_GROUP
      : QUERY_KEY.GENERATE_FURNITURE_PRODUCTS,
    {
      groupId,
      imageId,
      categoryId,
    },
  ];

  const initialProductsResponse =
    groupId !== null && productCacheEntry
      ? productCacheEntry.response
      : undefined;

  const query = useQuery<
    FurnitureProductsInfoResponse,
    Error,
    FurnitureProductsInfoResponse,
    ProductsQueryKey
  >({
    // queryKey에 그룹/이미지/카테고리 식별자를 직접 배치
    queryKey: productsQueryKey,
    queryFn: () => getGeneratedImageProducts(imageId!, categoryId!),
    enabled: Boolean(imageId) && categoryId !== null,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    ...(initialProductsResponse
      ? { initialData: initialProductsResponse }
      : {}),
  });

  useEffect(() => {
    if (groupId === null || categoryId === null) return;
    if (!query.data) return;
    const groupCache = useCurationCacheStore.getState().groups[groupId];
    const existing = groupCache?.products[categoryId] ?? null;
    if (existing?.response === query.data) {
      return;
    }
    saveGroupProducts({
      groupId,
      categoryId,
      response: query.data,
    });
  }, [groupId, categoryId, query.data, saveGroupProducts]);

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
        if (groupId !== null) {
          clearGroupCategories(groupId);
          queryClient.invalidateQueries({
            // 그룹 기반 카테고리 쿼리만 정밀 무효화
            predicate: (query) => {
              const [key, variables] = query.queryKey as [
                unknown,
                Partial<CategoriesQueryVariables>,
              ];
              return (
                key === QUERY_KEY.GENERATE_FURNITURE_CATEGORIES_GROUP &&
                variables?.groupId === groupId
              );
            },
          });
        } else {
          queryClient.invalidateQueries({
            // 단일 이미지 기반 카테고리 쿼리만 정밀 무효화
            predicate: (query) => {
              const [key, variables] = query.queryKey as [
                unknown,
                Partial<CategoriesQueryVariables>,
              ];
              return (
                key === QUERY_KEY.GENERATE_FURNITURE_CATEGORIES &&
                variables?.imageId === imageId
              );
            },
          });
        }
      },
      invalidateProducts: (
        groupId: number | null,
        imageId: number | null,
        categoryId?: number | null
      ) => {
        if (groupId !== null && categoryId !== null) {
          clearGroupProduct(groupId, categoryId);
        }
        queryClient.invalidateQueries({
          // 그룹/이미지별 상품 쿼리 정밀 무효화
          predicate: (query) => {
            const [key, variables] = query.queryKey as [
              unknown,
              Partial<ProductsQueryVariables>,
            ];

            if (groupId !== null) {
              if (key !== QUERY_KEY.GENERATE_FURNITURE_PRODUCTS_GROUP)
                return false;
              if (variables?.groupId !== groupId) return false;
              if (categoryId === undefined) return true; // 그룹 내 전체 무효화
              return variables?.categoryId === categoryId;
            }

            if (key !== QUERY_KEY.GENERATE_FURNITURE_PRODUCTS) return false;
            if (variables?.imageId !== imageId) return false;
            if (categoryId === undefined) return true; // 이미지 내 전체 무효화
            return variables?.categoryId === categoryId;
          },
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
