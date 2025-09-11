// useFloorPlan.hooks.ts (로직 담당)
import { useCallback, useEffect, useState } from 'react';

import { useFloorPlanApi } from '../api/floorPlanApi';
import { useFunnelStore } from '../stores/useFunnelStore';

import type { CompletedFloorPlan, ImageSetupSteps } from '../types/funnel';

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

  // Zustand 스토어에서 상태 가져오기
  const {
    floorPlan: floorPlan,
    setFloorPlanData: setFloorPlanData,
    setCurrentStep,
  } = useFunnelStore();

  // Zustand에서 이전 선택값 가져와서 초기화
  const [selectedId, setSelectedId] = useState<number | null>(
    floorPlan.floorPlanId || null
  );
  const [isMirror, setIsMirror] = useState<boolean>(
    floorPlan.isMirror || false
  );

  // 컴포넌트 마운트 시 현재 스텝 설정
  useEffect(() => {
    setCurrentStep(2);
  }, []);

  // 선택 상태가 변경될 때마다 Zustand에 저장
  useEffect(() => {
    if (selectedId !== null) {
      setFloorPlanData({
        floorPlanId: selectedId,
        isMirror: isMirror,
      });
    }
  }, [selectedId, isMirror]);

  const handleImageSelect = useCallback((id: number) => {
    setSelectedId(id);
    setIsMirror(false); // 이미지 선택 시 반전 초기화
  }, []);

  const handleFlipToggle = useCallback(() => {
    setIsMirror((prev) => !prev);
  }, []);

  const handleFloorPlanSelection = useCallback(() => {
    if (selectedId === null) return;

    // Step2 이후 데이터 초기화 (Step3, 4 데이터 클리어)
    // clearAfterStep(2);

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

    console.log('선택된 퍼널 페이로드:', payload);
    onNext(payload);
    console.log('실행됨');
  }, [
    selectedId,
    isMirror,
    context.houseType,
    context.roomType,
    context.areaType,
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
