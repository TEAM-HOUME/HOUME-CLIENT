import { MAIN_ACTIVITY_VALIDATION } from '../../types/funnel/validation';

import type { ActivityOptionsResponse } from '../../types/apis/activityInfo';

/**
 * 주요활동 선택 로직을 담당하는 훅
 */
export const useActivitySelection = (
  activityOptionsData?: ActivityOptionsResponse,
  selectedActivity?: string,
  onActivityChange?: (activityType?: string) => void
) => {
  // 타입 가드: 유효한 '주요활동' 카테고리 내의 값인지 체크
  const isValidActivityKey = (
    usage: string
  ): usage is keyof typeof MAIN_ACTIVITY_VALIDATION.combinationRules => {
    return usage in MAIN_ACTIVITY_VALIDATION.combinationRules;
  };

  // 현재 선택된 활동의 필수 가구 ID 리스트 반환
  const getRequiredFurnitureIds = (): number[] => {
    if (
      !selectedActivity ||
      !isValidActivityKey(selectedActivity) ||
      !activityOptionsData
    )
      return [];

    const requiredFurnitureCodes =
      MAIN_ACTIVITY_VALIDATION.combinationRules[selectedActivity]
        ?.requiredFurnitures || [];

    // 모든 카테고리의 모든 가구에서 필수 가구 찾기
    return requiredFurnitureCodes
      .map((code) => {
        for (const category of activityOptionsData.categories) {
          const furniture = category.furnitures.find((f) => f.code === code);
          if (furniture) return furniture.id;
        }
        return undefined;
      })
      .filter((id): id is number => id !== undefined); // API 데이터와 로컬 validation 데이터 불일치 시 undefined 반환, 해당 케이스 처리하는 로직
  };

  // ButtonGroup 배열 인터페이스와 단일 선택 비즈니스 로직 간 어댑터
  const handleActivityChange = (values: string[]) => {
    // 주요활동은 단일선택만 가능하지만, ButtonGroup의 onSelectionChange를 다중선택 기준으로 설계(T[]) → values의 타입을 배열로 선언, 메서드 내에서 values[0]으로 단일값으로 처리
    const newActivity = values[0] || undefined;
    onActivityChange?.(newActivity);
  };

  // ButtonGroup에서 사용할 selectedValues
  const selectedValues = selectedActivity ? [selectedActivity] : []; // 단일 값을 ButtonGroup 인터페이스에 맞게 배열로 변환

  return {
    selectedValues,
    handleActivityChange,
    getRequiredFurnitureIds,
    isValidActivityKey,
  };
};
