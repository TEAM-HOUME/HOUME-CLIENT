import { useEffect, useState } from 'react';
import { HOUSE_INFO_VALIDATION } from '../types/funnel/validation';
import { useHousingSelectionMutation } from '../apis/houseInfoApi';
import type { ImageSetupSteps } from '../types/funnel/steps';
import type {
  CompletedHouseInfo,
  HouseInfoErrors,
  HouseInfoFormData,
} from '../types/funnel/houseInfo';

export const useHouseInfo = (context: ImageSetupSteps['HouseInfo']) => {
  // 주거 선택 API 요청
  const housingSelection = useHousingSelectionMutation();

  // 초기값 설정: context에서 가져오기
  const [formData, setFormData] = useState({
    houseType: context.houseType,
    roomType: context.roomType,
    areaType: context.areaType,
  });

  const [errors, setErrors] = useState<HouseInfoErrors>({});

  // 개별 필드 변경 시 해당 필드의 에러 초기화
  useEffect(() => {
    if (errors.houseType) {
      setErrors((prev) => {
        const { houseType, ...rest } = prev;
        return rest;
      });
    }
  }, [formData.houseType]);

  useEffect(() => {
    if (errors.roomType) {
      setErrors((prev) => {
        const { roomType, ...rest } = prev;
        return rest;
      });
    }
  }, [formData.roomType]);

  useEffect(() => {
    if (errors.areaType) {
      setErrors((prev) => {
        const { areaType, ...rest } = prev;
        return rest;
      });
    }
  }, [formData.areaType]);

  // 제한된 값(아파트, 투룸 등)을 선택했는지 검증
  const validateFormFields = (): boolean => {
    const newErrors: HouseInfoErrors = {};

    // 모든 필드가 선택된 경우에만 제한값 검증 실행
    const isAllFieldsSelected = !!(
      formData.houseType &&
      formData.roomType &&
      formData.areaType
    );

    if (isAllFieldsSelected) {
      if (
        formData.houseType &&
        HOUSE_INFO_VALIDATION.restrictedValues.houseType.includes(
          formData.houseType
        )
      ) {
        newErrors.houseType = HOUSE_INFO_VALIDATION.messages.houseType;
      }
      if (
        formData.roomType &&
        HOUSE_INFO_VALIDATION.restrictedValues.roomType.includes(
          formData.roomType
        )
      ) {
        newErrors.roomType = HOUSE_INFO_VALIDATION.messages.roomType;
      }
    }

    setErrors(newErrors);
    return Object.values(newErrors).length === 0;
  };

  // 입력값 3개 입력 여부 확인 및 에러 상태 확인
  const isFormCompleted = !!(
    formData.houseType &&
    formData.roomType &&
    formData.areaType &&
    Object.values(errors).length === 0
  );

  // isFormCompleted == true일 때 버튼 enable -> handleSubmit 실행 가능
  const handleSubmit = (onNext: (data: CompletedHouseInfo) => void) => {
    const isValidInput = validateFormFields();

    // 타입 안전성 강화를 위해 타입 단언(as)을 제거 -> 아래 조건문으로 별도의 타입 검사 필요
    // 필수 필드가 누락되면 '집 구조 선택하기' 버튼이 disabled되어 handleSubmit이 실행될 수 없으므로 아래 조건문은 항상 통과함
    if (!formData.houseType || !formData.roomType || !formData.areaType) {
      console.error('필수 필드가 누락되었습니다');
      return;
    }

    const selectedHouseInfo = {
      houseType: formData.houseType,
      roomType: formData.roomType,
      areaType: formData.areaType,
    };

    console.log(selectedHouseInfo);

    const requestData = {
      ...selectedHouseInfo,
      isValid: isValidInput,
    };

    housingSelection.mutate(requestData, {
      onSuccess: (res) => {
        if (res) {
          console.log('유효한 주거정보, House ID:', res.houseId);
          console.log(res);

          // funnel의 context에 넣을 데이터(다음 step으로 전달할 데이터)
          const completedHouseInfo = {
            ...selectedHouseInfo,
            houseId: res.houseId,
          };

          onNext(completedHouseInfo);
        } else {
          console.log('유효하지 않은 주거정보');
        }
      },
    });
  };

  return {
    formData,
    setFormData,
    errors,
    handleSubmit,
    isFormCompleted,
  };
};
