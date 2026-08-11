// 도면 바텀시트 전용 로직
// 도면 상세 바텀시트 안에서의 뷰 전환 + 좌우반전 로직 담당

import { useMemo } from 'react';

import type { ExploreHouseTemplateDetailItemResponse } from '@apis/__generated__/data-contracts';

import { useFloorPlanStore } from '../stores/useFloorPlanStore';

export const useFloorPlanSheet = (
  detailViews: ExploreHouseTemplateDetailItemResponse[]
) => {
  const { selectedViewIndex, setViewIndex, isMirror, toggleMirror } =
    useFloorPlanStore();

  const isMultiView = detailViews.length > 1;

  const currentView = useMemo(
    () => detailViews[selectedViewIndex] ?? detailViews[0] ?? null,
    [detailViews, selectedViewIndex]
  );

  return {
    currentView, // 현재 보고 있는 뷰 (imageUrl, view)
    selectedViewIndex,
    setViewIndex,
    isMultiView, // 뷰 2개 이상 → prev/next 버튼 표시
    isMirror,
    toggleMirror,
  };
};
