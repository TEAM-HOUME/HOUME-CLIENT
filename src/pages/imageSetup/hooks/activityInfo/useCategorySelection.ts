import type { FurnitureCategory } from '../../types/apis/activityInfo';
import type { ActivityInfoFormData } from '../../types/funnel/activityInfo';

/**
 * 특정 카테고리의 가구 선택 로직을 관리하는 훅
 */
export const useCategorySelection = (
  category: FurnitureCategory | null,
  formData: ActivityInfoFormData,
  setFormData: React.Dispatch<React.SetStateAction<ActivityInfoFormData>>,
  globalConstraints: {
    applyConstraints: (ids: number[]) => number[];
  }
) => {
  // 카테고리가 없는 경우 빈 배열 반환
  if (!category) {
    return {
      selectedValues: [],
      handleChange: () => {},
    };
  }

  // 현재 카테고리에서 선택된 가구 ID들
  const selectedValues =
    formData.selectiveIds?.filter((id) =>
      category.furnitures.some((f) => f.id === id)
    ) || [];

  // 카테고리 가구 선택 변경 핸들러
  const handleChange = (ids: number[]) => {
    const currentIds = formData.selectiveIds || [];

    // 현재 카테고리 이외의 가구들은 유지
    const nonCategoryIds = currentIds.filter(
      (id) => !category.furnitures.some((f) => f.id === id)
    );

    // 새로운 선택과 기존 선택을 합치고 제약조건 적용
    const updatedIds = globalConstraints.applyConstraints([
      ...nonCategoryIds,
      ...ids,
    ]);

    setFormData((prev) => ({ ...prev, selectiveIds: updatedIds }));
  };

  return {
    selectedValues,
    handleChange,
  };
};
