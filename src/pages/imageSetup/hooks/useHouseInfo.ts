import { useEffect, useState } from 'react';

import { useHousingSelectionMutation } from '../apis/houseInfo';
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

  // 초기값 설정: funnel의 context에서 가져오기
  const [formData, setFormData] = useState<HouseInfoFormData>({
    houseType: context.houseType,
    roomType: context.roomType,
    areaType: context.areaType,
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
          onNext({
            houseType: formData.houseType,
            roomType: formData.roomType,
            areaType: formData.areaType,
            houseId: res.houseId,
          });
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
  };
};
