import { useCallback, useState } from 'react';

import { MAX_MOOD_BOARD_SELECTION } from '../constants/interiorStyle';
import { useFunnelStore } from '../stores/useFunnelStore';

import type {
  CompletedInteriorStyle,
  ImageSetupSteps,
} from '../types/funnel/steps';

export const useInteriorStyle = (
  context: ImageSetupSteps['InteriorStyle'],
  onNext: (data: CompletedInteriorStyle) => void
) => {
  // Zustand store에서 저장된 데이터
  const savedMoodBoardIds = useFunnelStore((state) => state.moodBoardIds);
  const savedHouseInfo = useFunnelStore((state) => state.houseInfo);
  const savedFloorPlan = useFunnelStore((state) => state.floorPlan);

  const [selectedImages, setSelectedImages] = useState<number[]>(
    savedMoodBoardIds ?? context.moodBoardIds ?? []
  );

  // 이미지 선택/해제를 처리하는 함수
  const handleImageSelect = useCallback(
    (imageId: number) => {
      setSelectedImages((prev) => {
        const isSelected = prev.includes(imageId);

        if (isSelected) {
          // 이미 선택된 경우: 선택 해제
          return prev.filter((id) => id !== imageId);
        }
        if (prev.length >= MAX_MOOD_BOARD_SELECTION) {
          // 최대 5개까지만 허용
          return prev;
        }
        return [...prev, imageId];
      });
    },
    [setSelectedImages]
  );

  const handleNext = () => {
    // Zustand에 저장
    useFunnelStore.getState().setMoodBoardIds(selectedImages);

    const payload: CompletedInteriorStyle = {
      houseType: savedHouseInfo?.houseType ?? context.houseType,
      roomType: savedHouseInfo?.roomType ?? context.roomType,
      areaType: savedHouseInfo?.areaType ?? context.areaType,
      houseId: savedHouseInfo?.houseId ?? context.houseId,
      floorPlan: savedFloorPlan ?? context.floorPlan,
      moodBoardIds: selectedImages,
    };

    // console.log('선택된 퍼널 페이로드:', payload);

    onNext(payload);
  };

  // 최소 1개 이상 선택
  const isDataComplete = selectedImages.length > 0;

  return {
    selectedImages,
    handleImageSelect,
    handleNext,
    isDataComplete,
  };
};
