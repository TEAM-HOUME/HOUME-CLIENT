import { useEffect, useState } from 'react';

import { queryClient } from '@/shared/apis/queryClient';

import { useHousingSelectionMutation } from '../apis/houseInfo';
import { useFunnelStore } from '../stores/useFunnelStore';
import { HOUSE_INFO_VALIDATION } from '../types/funnel/validation';

import type {
  CompletedHouseInfo,
  HouseInfoErrors,
  HouseInfoFormData,
} from '../types/funnel/houseInfo';
import type { ImageSetupSteps } from '../types/funnel/steps';

export const useHouseInfo = (context: ImageSetupSteps['HouseInfo']) => {
  // 주거 옵션 선택 API
  const housingSelection = useHousingSelectionMutation();

  // Zustand store에서 저장된 데이터
  const savedHouseInfo = useFunnelStore((state) => state.houseInfo);

  // 초기값 설정: Zustand에 값이 있으면 사용, 없으면 context 사용
  const [formData, setFormData] = useState<HouseInfoFormData>({
    houseType: savedHouseInfo?.houseType ?? context.houseType,
    roomType: savedHouseInfo?.roomType ?? context.roomType,
    areaType: savedHouseInfo?.areaType ?? context.areaType,
  });

  const [errors, setErrors] = useState<HouseInfoErrors>({});

  // 타입 가드
  const isCompleteHouseInfo = (
    data: HouseInfoFormData
  ): data is Required<HouseInfoFormData> => {
    return !!(data.houseType && data.roomType && data.areaType);
  };

  // 개별 필드 변경 시 해당 필드의 에러만 클리어
  useEffect(() => {
    setErrors((prev) => {
      if (prev.houseType) {
        const { houseType, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, [formData.houseType]);

  useEffect(() => {
    setErrors((prev) => {
      if (prev.roomType) {
        const { roomType, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, [formData.roomType]);

  useEffect(() => {
    setErrors((prev) => {
      if (prev.areaType) {
        const { areaType, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, [formData.areaType]);

  // 제한된 값(아파트, 투룸 등)을 선택했는지 검증
  const validateFormFields = (data: HouseInfoFormData): boolean => {
    const newErrors: HouseInfoErrors = {};

    if (
      data.houseType &&
      HOUSE_INFO_VALIDATION.restrictedValues.houseType.includes(data.houseType)
    ) {
      newErrors.houseType = HOUSE_INFO_VALIDATION.messages.houseType;
    }
    if (
      data.roomType &&
      HOUSE_INFO_VALIDATION.restrictedValues.roomType.includes(data.roomType)
    ) {
      newErrors.roomType = HOUSE_INFO_VALIDATION.messages.roomType;
    }

    setErrors(newErrors);
    return Object.values(newErrors).length === 0;
  };

  // 입력값 3개 입력 여부 확인 및 에러 상태 확인
  const isFormCompleted =
    isCompleteHouseInfo(formData) && Object.values(errors).length === 0;

  // 에러가 있는지 확인
  const hasError = Boolean(
    errors.houseType || errors.roomType || errors.areaType
  );

  // isFormCompleted == true일 때 버튼 enable, handleSubmit 실행
  const handleSubmit = (onNext: (data: CompletedHouseInfo) => void) => {
    if (!isFormCompleted) return;

    const isValidInput = validateFormFields(formData);

    housingSelection.mutate(
      {
        houseType: formData.houseType,
        roomType: formData.roomType,
        areaType: formData.areaType,
        isValid: isValidInput,
      },
      {
        onSuccess: (res) => {
          const completedData: CompletedHouseInfo = {
            houseType: formData.houseType,
            roomType: formData.roomType,
            areaType: formData.areaType,
            houseId: res.houseId,
          };

          // Zustand에 저장
          useFunnelStore.getState().setHouseInfo(completedData);

          // @use-funnel의 스텝들은 하나의 페이지 안의 컴포넌트
          // 뒤로가기, 앞으로가기 시에도 언마운트되지 않으므로, 해당 스텝에 진입할 때마다 실행되어야하는 api는 invalidate 필요
          queryClient.invalidateQueries({ queryKey: ['floorPlan'] });

          onNext(completedData);
        },
      }
    );
  };

  return {
    formData,
    setFormData,
    errors,
    handleSubmit,
    isFormCompleted,
    hasError,
  };
};
