import { useCallback, useState } from 'react';

import { useFloorPlanQuery } from '../apis/floorPlan';
import { useFunnelStore } from '../stores/useFunnelStore';

import type {
  CompletedFloorPlan,
  ImageSetupSteps,
} from '../types/funnel/steps';

export const useFloorPlan = (
  context: ImageSetupSteps['FloorPlan'],
  onNext: (data: CompletedFloorPlan) => void
) => {
  // FloorPlan 컴포넌트 렌더링 -> useFloorPlan 훅 실행 -> 서버가 사용자 선택 정보 기반으로 도면 반환
  const { data, isLoading, error, isError } = useFloorPlanQuery();
  // console.log('도면 데이터: ', data);

  // Zustand store에서 저장된 데이터
  const savedFloorPlan = useFunnelStore((state) => state.floorPlan);
  const savedHouseInfo = useFunnelStore((state) => state.houseInfo);

  const [selectedId, setSelectedId] = useState<number | null>(
    savedFloorPlan?.floorPlanId ?? context.floorPlan?.floorPlanId ?? null
  );
  const [isMirror, setIsMirror] = useState<boolean>(
    savedFloorPlan?.isMirror ?? context.floorPlan?.isMirror ?? false
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

    const floorPlanData = {
      floorPlanId: selectedId,
      isMirror: isMirror,
    };

    // Zustand에 저장
    useFunnelStore.getState().setFloorPlan(floorPlanData);

    const payload: CompletedFloorPlan = {
      houseType: savedHouseInfo?.houseType ?? context.houseType,
      roomType: savedHouseInfo?.roomType ?? context.roomType,
      areaType: savedHouseInfo?.areaType ?? context.areaType,
      houseId: savedHouseInfo?.houseId ?? context.houseId,
      floorPlan: floorPlanData,
    };

    onNext(payload);
  }, [
    selectedId,
    isMirror,
    savedHouseInfo,
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
