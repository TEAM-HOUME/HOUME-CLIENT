import { useCallback, useEffect, useState } from 'react';
import { MAX_MOOD_BOARD_SELECTION } from '../../constants/step3.constants';
import { useFunnelStore } from '../../stores/useFunnelStore';
import type {
  CompletedInteriorTaste,
  ImageSetupSteps,
} from '../../types/funnel';

export const useInteriorStyle = (
  context: ImageSetupSteps['InteriorTaste'],
  onNext: (data: CompletedInteriorTaste) => void
) => {
  // Zustand store에서 상태 가져오기
  const { step3, setStep3Data, setCurrentStep } = useFunnelStore();

  const [selectedImages, setSelectedImages] = useState<number[]>(
    step3.moodBoardIds || []
  );

  // 컴포넌트 마운트 시 현재 스텝 설정
  useEffect(() => {
    setCurrentStep(3);
  }, []);

  useEffect(() => {
    setStep3Data({
      moodBoardIds: selectedImages,
    });
  }, [selectedImages]);

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

    // clearAfterStep(3);

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
