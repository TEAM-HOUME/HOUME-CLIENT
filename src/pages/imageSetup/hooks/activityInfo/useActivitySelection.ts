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

    const requiredCodes =
      MAIN_ACTIVITY_VALIDATION.combinationRules[selectedActivity]
        ?.requiredFurnitures || [];

    // 모든 카테고리의 모든 가구에서 필수 가구 찾기
    return requiredCodes
      .map((code) => {
        for (const category of activityOptionsData.categories) {
          const furniture = category.furnitures.find((f) => f.code === code);
          if (furniture) return furniture.id;
        }
        return undefined;
      })
      .filter((id): id is number => id !== undefined);
  };

  // 주요활동 변경 핸들러
  const handleActivityChange = (values: string[]) => {
    const newActivity = values[0] || undefined;
    onActivityChange?.(newActivity);
  };

  // ButtonGroup에서 사용할 selectedValues
  const selectedValues = selectedActivity ? [selectedActivity] : [];

  return {
    selectedValues,
    handleActivityChange,
    getRequiredFurnitureIds,
    isValidActivityKey,
  };
};
