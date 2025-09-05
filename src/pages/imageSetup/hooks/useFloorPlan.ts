// useFloorPlan.hooks.ts (로직 담당)
import { useCallback, useState } from 'react';
import { useFloorPlanApi } from '../apis/floorPlanApi';
import type {
  CompletedFloorPlan,
  ImageSetupSteps,
} from '../types/funnel/steps';

// interface SelectedFloorPlanTypes {
//   id: number;
//   src: string;
//   flipped: boolean;
// }

export const useFloorPlan = (
  context: ImageSetupSteps['FloorPlan'],
  onNext: (data: CompletedFloorPlan) => void
) => {
  // FloorPlan 컴포넌트 렌더링 -> useFloorPlan 훅 실행
  // -> useFloorPlanQuery 실행 -> 데이터 fetching
  const { data, isLoading, error, isError } = useFloorPlanApi();
  console.log('도면 데이터: ', data);

  // funnel의 context에서 초기값 설정
  const [selectedId, setSelectedId] = useState<number | null>(
    context.floorPlan?.floorPlanId || null
  );
  const [isMirror, setIsMirror] = useState<boolean>(
    context.floorPlan?.isMirror || false
  );

  const handleImageSelect = useCallback((id: number) => {
    setSelectedId(id);
    setIsMirror(false); // 이미지 선택 시 반전 초기화
  }, []);

  const handleFlipToggle = useCallback(() => {
    setIsMirror((prev) => !prev);
  }, []);

  const handleFloorPlanSelection = useCallback(() => {
    if (selectedId === null) return;

    const payload: CompletedFloorPlan = {
      houseType: context.houseType,
      roomType: context.roomType,
      areaType: context.areaType,
      houseId: context.houseId,
      floorPlan: {
        floorPlanId: selectedId,
        isMirror: isMirror,
      },
    };

    onNext(payload);
  }, [
    selectedId,
    isMirror,
    context.houseType,
    context.roomType,
    context.areaType,
    context.houseId,
    onNext,
  ]);

  return {
    // API 데이터
    floorPlanList: data?.floorPlanList,
    isLoading,
    error,
    isError,

    // 선택 상태
    selectedId,
    isMirror,

    // 액션 함수
    handleImageSelect,
    handleFlipToggle,
    handleFloorPlanSelection,

    // 선택된 이미지 정보
    selectedImage:
      selectedId && data?.floorPlanList
        ? data.floorPlanList.find((item) => item.id === selectedId)
        : null,
  };
};
