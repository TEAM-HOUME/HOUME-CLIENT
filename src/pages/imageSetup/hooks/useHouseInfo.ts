import { useEffect, useState } from 'react';
import {
  HOUSE_INFO_VALIDATION,
  type CompletedHouseInfo,
  type ImageSetupSteps,
} from '../types/funnel';
import { useHouseInfoApi } from '../api/houseInfoApi';
import { useFunnelStore } from '../stores/useFunnelStore';
import { usePrefetchMoodBoard } from '../api/interiorStyleApi';

interface FormErrors {
  houseType?: string;
  roomType?: string;
  areaType?: string;
}

export const useHouseInfo = (context: ImageSetupSteps['HouseInfo']) => {
  // 집 구조 선택 API 요청
  const selectHouseInfoRequest = useHouseInfoApi();

  // Zustand store에서 상태 가져오기
  const {
    houseInfo: houseInfo,
    sethouseInfoData: setHouseInfoData,
    setCurrentStep,
  } = useFunnelStore();

  // 무드보드 이미지 사전로딩
  const { prefetchMoodBoard } = usePrefetchMoodBoard();
  prefetchMoodBoard();
  console.log('prefetch 완료');

  // useEffect(() => {
  //   // 한 프레임 뒤에 실행 (persist 복원 후)
  //   setTimeout(() => {
  //     resetFunnel();
  //     // TODO: hydration 타이밍 알아보기
  //     // 컴포넌트 마운트 시 resetFunnel() 실행, 하지만 Zustand persist가 나중에 sessionStorage에서 데이터 복원(Zustand persist의 hydratino 타이밍)
  //     // 결과적으로 이전 데이터가 다시 나타남 -> 지연 초기화 필요(한 프레임 뒤에 실행시키기)
  //   }, 0);
  // }, []);
  // // TODO: 아래 코드 console.log 찍어보면 둘 다 빈 배열, 하지만 step1 페이지에는 버튼이 선택된 상태로 렌더링됨
  // // Zustand persist의 hydration 타이밍 관련?
  // console.log(step1);
  // console.log(context);

  // 초기값 설정: funnel의 context보다 zustand store 우선
  const [formData, setFormData] = useState({
    houseType: houseInfo.houseType || context.houseType,
    roomType: houseInfo.roomType || context.roomType,
    areaType: houseInfo.areaType || context.areaType,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // 컴포넌트 마운트 시 현재 스텝 설정
  useEffect(() => {
    setCurrentStep(1);
  }, []);

  useEffect(() => {
    // setStep1Data({ }) 안에 있는 데이터가 setStep1Data의 정의에 의해 spread돼서 zustand의 state에 저장됨
    // houseType, roomType, areaType 중 하나만 바뀌어도 그냥 셋 다 spread돼서 저장되는 것
    setHouseInfoData({
      houseType: formData.houseType,
      roomType: formData.roomType,
      areaType: formData.areaType,
    });
  }, [formData]);

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
    const newErrors: FormErrors = {};

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

    selectHouseInfoRequest.mutate(requestData, {
      onSuccess: (res) => {
        if (res) {
          console.log('유효한 주거정보, House ID:', res.houseId);
          console.log(res);

          // zustand store에 houseId 저장
          setHouseInfoData({
            ...selectedHouseInfo,
            houseId: res.houseId,
          });

          // Step1 이후 데이터 초기화 (Step2, 3, 4 데이터 클리어)
          // clearAfterStep(1);

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
