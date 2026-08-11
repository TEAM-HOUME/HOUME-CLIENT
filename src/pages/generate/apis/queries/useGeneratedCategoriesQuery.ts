import { useEffect, useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useCurationCacheStore } from '@pages/generate/stores/useCurationCacheStore';
import { useCurationStore } from '@pages/generate/stores/useCurationStore';
import type { FurnitureCategoriesResponse } from '@pages/generate/types/furniture';

import type { FurnitureCategoryCode } from '@shared/detection/furnitureCategoryMapping';

import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys, type CategoriesQueryVariables } from '@constants/queryKey';

type CategoriesQueryKey = ReturnType<
  | typeof queryKeys.furniture.categoriesGroup
  | typeof queryKeys.furniture.categories
>;

export const getGeneratedImageCategories = async (
  imageId: number,
  detectedObjects: FurnitureCategoryCode[]
): Promise<FurnitureCategoriesResponse> => {
  return request<FurnitureCategoriesResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.GENERATE.CURATION_CATEGORIES(imageId),
    query: { detectedObjects },
  });
};

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

  const categoryQueryVars: CategoriesQueryVariables = {
    groupId,
    imageId,
    detectionSignature,
    codes: normalizedDetectedObjects,
  };

  const categoriesQueryKey: CategoriesQueryKey =
    groupId !== null
      ? queryKeys.furniture.categoriesGroup(categoryQueryVars)
      : queryKeys.furniture.categories(categoryQueryVars);

  const initialCategoriesResponse = canUseGroupInitialData
    ? groupCategoriesEntry!.response
    : undefined;

  const query = useQuery<
    FurnitureCategoriesResponse,
    Error,
    FurnitureCategoriesResponse,
    CategoriesQueryKey
  >({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps -- imageId, normalizedDetectedObjects는 categoriesQueryKey(factory) 내부에 포함됨
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
    if (imageId === null) return;
    if (!query.data) return;
    const existing =
      useCurationCacheStore.getState().groups[groupId]?.categories ?? null;
    if (
      existing &&
      existing.imageId === imageId &&
      existing.detectionSignature === detectionSignature &&
      existing.response === query.data
    ) {
      return;
    }
    saveGroupCategories({
      groupId,
      imageId,
      response: query.data,
      detectedObjects: normalizedDetectedObjects,
      detectionSignature,
    });
  }, [
    groupId,
    imageId,
    query.data,
    detectionSignature,
    normalizedDetectedObjects,
    saveGroupCategories,
  ]);

  useEffect(() => {
    if (imageId === null) return;
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
    if (selectedCategoryId !== null && exists) return;

    const defaultCategoryId = categories[0]?.id ?? null;
    if (defaultCategoryId === null) return;
    if (defaultCategoryId === selectedCategoryId) return;

    selectCategory(imageId, defaultCategoryId);
  }, [imageId, query.data, selectCategory, selectedCategoryId]);

  return query;
};
