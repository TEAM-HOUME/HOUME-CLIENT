import { FURNITURE_SELECTION } from '../../constants/furnitureSelection';

/**
 * 전역 제약조건을 관리하는 훅
 * - 최대 선택 제한
 * - 필수 가구 보호
 */
export const useGlobalConstraints = (
  currentSelections: number[] = [],
  requiredFurnitureIds: number[] = [],
  hasSelectedActivity: boolean = true
) => {
  const { MAX_SELECTION_COUNT } = FURNITURE_SELECTION;

  // 현재 선택된 총 개수
  const totalSelected = currentSelections.length;

  // 필수 가구인지 확인
  const isRequiredFurniture = (furnitureId: number): boolean => {
    return requiredFurnitureIds.includes(furnitureId);
  };

  // 특정 가구 선택 해제 가능 여부
  const canDeselect = (furnitureId: number): boolean => {
    return !isRequiredFurniture(furnitureId);
  };

  // 개별 가구 선택 가능 여부 확인
  const canSelectFurniture = (furnitureId: number): boolean => {
    // 주요 활동이 선택되지 않은 경우 모든 가구 비활성화
    if (!hasSelectedActivity) return false;

    // 이미 선택된 경우는 선택 해제 가능 여부만 확인
    if (currentSelections.includes(furnitureId))
      return canDeselect(furnitureId);

    // 선택되지 않은 경우 추가 선택 가능 여부 확인
    return totalSelected < MAX_SELECTION_COUNT; // true: 더 선택 가능
  };

  // 가구 추가/삭제 시에도 항상 필수 가구가 포함된 selection 반환
  const includeRequiredFurniture = (selections: number[]): number[] => {
    return [...new Set([...requiredFurnitureIds, ...selections])];
  };

  // 최대 개수 제한을 적용한 안전한 selection 반환
  // ButtonGroup의 isActive로 UI레벨에서 클릭을 disable시키는 방어 로직이 있지만, 데이터 레벨에서의 방어 로직도 추가해 더 안전하게 관리
  const applyMaxCountLimit = (selections: number[]): number[] => {
    if (selections.length <= MAX_SELECTION_COUNT) return selections;

    // 필수 가구는 유지하고 나머지에서 조정
    const nonRequiredSelections = selections.filter(
      (id) => !requiredFurnitureIds.includes(id)
    );
    const maxNonRequired = Math.max(
      0,
      MAX_SELECTION_COUNT - requiredFurnitureIds.length
    );
    const allowedNonRequired = nonRequiredSelections.slice(0, maxNonRequired);

    return [...requiredFurnitureIds, ...allowedNonRequired];
  };

  // 모든 제약조건을 적용한 최종 selection
  const applyConstraints = (selections: number[]): number[] => {
    return applyMaxCountLimit(includeRequiredFurniture(selections));
  };

  return {
    totalSelected,
    canDeselect,
    canSelectFurniture,
    isRequiredFurniture,
    requiredFurnitureIds,
    applyConstraints,
  };
};
