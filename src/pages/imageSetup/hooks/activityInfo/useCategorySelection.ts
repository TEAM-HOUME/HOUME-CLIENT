import { TOAST_TYPE, TOASTER_ID } from '@shared/types/toast';

import type { FurnitureCategoryGroup } from '@apis/__generated__/data-contracts';

import { useToast } from '@components/toast/useToast';

import { TOAST_MESSAGE } from '@constants/toastMessage';

import type { useGlobalConstraints } from './useGlobalConstraints';
import type {
  ActivityInfoFormData,
  CategorySelectionMode,
} from '../../types/funnel/activityInfo';

export type CategorySelectionAnalyticsCallbacks = {
  onFurnitureSelect?: (chips?: string) => void;
  onFurnitureDeselect?: (chips?: string) => void;
  onEssentialDeselectToast?: (chips?: string) => void;
};

/**
 * 특정 카테고리의 가구 선택 로직을 관리하는 훅
 * Chip 가구 토글 인터페이스 제공
 * - single모드: 카테고리 내 하나만 선택 가능 (재선택 시 해제, 다른 항목 선택 시 기존 항목 교체)
 * - multiple모드: 카테고리 내 여러 개 선택 가능 (전역 최대 6개 + 필수 가구 제약 적용)
 */
export const useCategorySelection = (
  category: FurnitureCategoryGroup | null,
  mode: CategorySelectionMode,
  formData: ActivityInfoFormData,
  setFormData: React.Dispatch<React.SetStateAction<ActivityInfoFormData>>,
  globalConstraints: ReturnType<typeof useGlobalConstraints>,
  buildChips: (furnitureIds: number[]) => string | undefined,
  analytics?: CategorySelectionAnalyticsCallbacks
) => {
  // useToast는 early return 전에 호출
  const { notify } = useToast();
  const furnitures = category?.furnitures ?? [];

  // 카테고리가 없는 경우 빈 인터페이스 반환
  if (!category) {
    return {
      selectedValues: [] as number[],
      toggleFurniture: () => {},
      furnitureStatus: [] as { id: number; isActive: boolean }[],
    };
  }

  // 현재 카테고리에서 선택된 가구 ID들
  const selectedValues =
    formData.furnitureIds?.filter((id) =>
      furnitures.some((f) => f.id === id)
    ) || [];

  // 가구 토글
  // - 이미 선택된 가구: 선택 해제 (필수 가구는 해제 불가)
  // - 미선택 가구 + single: 같은 카테고리 기존 선택 제거 후 추가
  // - 미선택 가구 + multiple: 추가 후 전역 제약(최대 6개 + 필수 가구 포함) 적용
  const toggleFurniture = (furnitureId: number) => {
    const currentIds = formData.furnitureIds || [];
    const isSelected = currentIds.includes(furnitureId);

    // 1. 선택한 값 해제: single/multiple 공통
    if (isSelected) {
      if (!globalConstraints.canDeselect(furnitureId)) {
        // 필수 가구는 해제 불가 — 사용자에게 toast로 피드백
        notify({
          text: TOAST_MESSAGE.REQUIRED_ITEM_LOCKED,
          type: TOAST_TYPE.INFO,
          options: { toasterId: TOASTER_ID.BOTTOM_4 },
        });
        analytics?.onEssentialDeselectToast?.(
          buildChips(formData.furnitureIds || [])
        );
        return;
      }
      const updatedFurnitureIds = currentIds.filter((id) => id !== furnitureId);
      setFormData((prev) => ({ ...prev, furnitureIds: updatedFurnitureIds }));
      analytics?.onFurnitureDeselect?.(buildChips(updatedFurnitureIds));
      return;
    }

    // 2. 선택값 추가: single/multiple 분기
    if (mode === 'single') {
      // 이 카테고리에 속한 기존 선택을 모두 제거하고 새 항목만 추가
      const preservedIds = currentIds.filter(
        (id) => !furnitures.some((f) => f.id === id)
      );
      const updatedFurnitureIds = globalConstraints.applyConstraints([
        ...preservedIds,
        furnitureId,
      ]);
      setFormData((prev) => ({ ...prev, furnitureIds: updatedFurnitureIds }));
      analytics?.onFurnitureSelect?.(buildChips(updatedFurnitureIds));
      return;
    }

    // multiple: 현재 선택에 새 항목 추가 후 전역 제약 적용
    const updatedFurnitureIds = globalConstraints.applyConstraints([
      ...currentIds,
      furnitureId,
    ]);
    setFormData((prev) => ({ ...prev, furnitureIds: updatedFurnitureIds }));
    analytics?.onFurnitureSelect?.(buildChips(updatedFurnitureIds));
  };

  // 각 가구별 활성화 상태 정보 (Chip의 disabled 매핑)
  // swagger optional이지만 백엔드 명세상 id는 항상 옴 → non-null assertion 사용
  const furnitureStatus = furnitures.map((furniture) => ({
    id: furniture.id!,
    isActive: globalConstraints.canSelectFurniture(furniture.id!),
  }));

  return {
    selectedValues,
    toggleFurniture,
    furnitureStatus,
  };
};
