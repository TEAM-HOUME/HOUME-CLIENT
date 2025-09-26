/**
 * 전역 제약조건을 관리하는 훅
 * - 최대 6개 선택 제한
 * - 필수 가구 보호
 */
export const useGlobalConstraints = (
  currentSelections: number[] = [],
  requiredFurnitureIds: number[] = []
) => {
  // 현재 선택된 총 개수
  const totalSelected = currentSelections.length;

  // 최대 개수 도달 여부
  const maxReached = totalSelected >= 6;

  // 추가 선택 가능 여부
  const canSelectMore = totalSelected < 6;

  // 필수 가구인지 확인
  const isRequiredFurniture = (furnitureId: number): boolean => {
    return requiredFurnitureIds.includes(furnitureId);
  };

  // 특정 가구 선택 해제 가능 여부
  const canDeselect = (furnitureId: number): boolean => {
    return !isRequiredFurniture(furnitureId);
  };

  // 새로운 선택이 가능한지 확인 (최대 개수 고려)
  const canSelect = (newSelectionCount: number): boolean => {
    return totalSelected + newSelectionCount <= 6;
  };

  // 필수 가구가 포함된 안전한 selection 반환
  const withRequiredFurniture = (selections: number[]): number[] => {
    return [...new Set([...requiredFurnitureIds, ...selections])];
  };

  // 최대 개수 제한을 적용한 안전한 selection 반환
  const withMaxLimit = (selections: number[]): number[] => {
    if (selections.length <= 6) return selections;

    // 필수 가구는 유지하고, 나머지에서 조정
    const nonRequiredSelections = selections.filter(
      (id) => !requiredFurnitureIds.includes(id)
    );
    const maxNonRequired = Math.max(0, 6 - requiredFurnitureIds.length);
    const allowedNonRequired = nonRequiredSelections.slice(0, maxNonRequired);

    return [...requiredFurnitureIds, ...allowedNonRequired];
  };

  // 모든 제약조건을 적용한 최종 selection
  const applyConstraints = (selections: number[]): number[] => {
    return withMaxLimit(withRequiredFurniture(selections));
  };

  return {
    totalSelected,
    maxReached,
    canSelectMore,
    canSelect,
    canDeselect,
    isRequiredFurniture,
    requiredFurnitureIds,
    applyConstraints,
    withRequiredFurniture,
    withMaxLimit,
  };
};
