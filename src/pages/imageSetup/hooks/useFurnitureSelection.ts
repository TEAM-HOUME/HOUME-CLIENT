import { useCallback } from 'react';

import { CATEGORY_SELECTION_CONFIG } from '../types/funnel/activityInfo';

import type { FurnitureCategory } from '../types/apis/activityInfo';

/**
 * 가구 선택 전체를 관리하는 훅
 */
export const useFurnitureSelection = (
  selectedIds: number[] = [],
  onSelectionChange: (newIds: number[]) => void,
  constraints: {
    applyConstraints: (ids: number[]) => number[];
  }
) => {
  // id 또는 id배열 -> code배열 변환 (ButtonGroup selectedValues용)
  const getSelectedCodes = useCallback(
    (
      options: { id: number; code: string }[],
      ids?: number | number[]
    ): string[] => {
      if (!ids) return [];

      // 단일 id인 경우 배열로 변환
      const idArray = Array.isArray(ids) ? ids : [ids];

      return idArray
        .map((id) => options.find((option) => option.id === id)?.code)
        .filter((code): code is string => code !== undefined);
    },
    []
  );

  // 카테고리별 가구 선택 핸들러
  const handleCategorySelection = (
    category: FurnitureCategory,
    selectedCodes: string[]
  ) => {
    // code를 id로 변환
    const selectedNewIds = selectedCodes
      .map((code) => category.furnitures.find((f) => f.code === code)?.id)
      .filter((id): id is number => id !== undefined);

    const selectionMode =
      CATEGORY_SELECTION_CONFIG[
        category.nameEng as keyof typeof CATEGORY_SELECTION_CONFIG
      ];

    // 현재 카테고리의 기존 선택 제거
    const currentIds = selectedIds || [];
    const otherCategoryIds = currentIds.filter((id) => {
      return !category.furnitures.some((f) => f.id === id);
    });

    let newIds: number[];

    if (selectionMode === 'single') {
      // 단일 선택: 해당 카테고리에서 하나만 선택
      newIds = [...otherCategoryIds, ...selectedNewIds.slice(0, 1)];
    } else {
      // 다중 선택: 여러 개 선택 가능
      newIds = [...otherCategoryIds, ...selectedNewIds];
    }

    // 제약조건 적용
    const finalIds = constraints.applyConstraints(newIds);
    onSelectionChange(finalIds);
  };

  // 특정 카테고리에서 선택된 가구들의 ID 반환
  const getCategorySelectedIds = (category: FurnitureCategory): number[] => {
    return selectedIds.filter((id) =>
      category.furnitures.some((furniture) => furniture.id === id)
    );
  };

  // 특정 카테고리에서 선택된 가구들의 code 반환
  const getCategorySelectedCodes = (category: FurnitureCategory): string[] => {
    const categoryIds = getCategorySelectedIds(category);
    return getSelectedCodes(category.furnitures, categoryIds);
  };

  return {
    getSelectedCodes,
    handleCategorySelection,
    getCategorySelectedIds,
    getCategorySelectedCodes,
  };
};
