import type { useGlobalConstraints } from './useGlobalConstraints';
import type { FurnitureCategory } from '../../types/apis/activityInfo';
import type { ActivityInfoFormData } from '../../types/funnel/activityInfo';

/**
 * 특정 카테고리의 가구 선택 로직을 관리하는 훅
 */
export const useCategorySelection = (
  category: FurnitureCategory | null,
  formData: ActivityInfoFormData,
  setFormData: React.Dispatch<React.SetStateAction<ActivityInfoFormData>>,
  globalConstraints: ReturnType<typeof useGlobalConstraints> // 훅의 반환타입
  // +) globalConstraints의 applyConstraints(), canSelectFurniture() 두 가지 함수만 사용하므로 Duck Typing을 사용한 globalConstraints의 타입 선언도 가능(유연성 증가, 안전성 감소)
) => {
  // 카테고리가 없는 경우 빈 배열 반환
  if (!category) {
    return {
      selectedValues: [],
      handleChange: () => {},
      furnitureStatus: [],
    };
  }

  // 현재 카테고리에서 선택된 가구 ID들
  const selectedValues =
    formData.selectiveIds?.filter((id) =>
      category.furnitures.some((f) => f.id === id)
    ) || [];

  // 카테고리 가구 선택 변경 핸들러
  // ButtonGroup 내부 로직에서 단일/다중 선택 분기처리 후 ids파라미터에 선택된 값이 전달됨
  const handleChange = (ids: number[]) => {
    // ids: 해당 카테고리에서 선택한 모든 가구들(ButtonGroup에서 전달)

    // 현재 선택된 모든 가구들
    const currentIds = formData.selectiveIds || [];

    // 현재 카테고리 이외의 카테고리에서 선택된 모든 가구들
    const otherCategoryIds = currentIds.filter(
      (id) => !category.furnitures.some((f) => f.id === id)
    );

    // 기존에 선택한 가구와 새롭게 선택한 가구를 합치고, 제약조건 적용
    const updatedIds = globalConstraints.applyConstraints([
      ...otherCategoryIds,
      ...ids,
    ]);

    setFormData((prev) => ({ ...prev, selectiveIds: updatedIds }));
  };

  // 각 가구별 활성화 상태 정보
  const furnitureStatus = category.furnitures.map((furniture) => ({
    id: furniture.id,
    isActive: globalConstraints.canSelectFurniture(furniture.id),
  }));

  return {
    selectedValues,
    handleChange,
    furnitureStatus,
  };
};
