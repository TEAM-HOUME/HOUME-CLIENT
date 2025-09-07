import { useCallback, useState } from 'react';
import { MAX_MOOD_BOARD_SELECTION } from '../constants/interiorStyle';
import type {
  CompletedInteriorStyle,
  ImageSetupSteps,
} from '../types/funnel/steps';

export const useInteriorStyle = (
  context: ImageSetupSteps['InteriorStyle'],
  onNext: (data: CompletedInteriorStyle) => void
) => {
  const [selectedImages, setSelectedImages] = useState<number[]>(
    context.moodBoardIds || []
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
    // 디버깅용
    const payload = {
      houseType: context.houseType,
      roomType: context.roomType,
      areaType: context.areaType,
      floorPlan: {
        floorPlanId: context.floorPlan.floorPlanId,
        isMirror: context.floorPlan.isMirror,
      },
      moodBoardIds: selectedImages,
    };

    console.log('선택된 퍼널 페이로드:', payload);

    onNext({
      houseType: context.houseType,
      roomType: context.roomType,
      areaType: context.areaType,
      houseId: context.houseId,
      floorPlan: context.floorPlan,
      moodBoardIds: selectedImages,
    });
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
