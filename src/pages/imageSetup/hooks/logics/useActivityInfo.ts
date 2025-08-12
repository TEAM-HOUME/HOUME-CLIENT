import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MAIN_ACTIVITY_OPTIONS,
  MAIN_ACTIVITY_VALIDATION,
  type ImageSetupSteps,
} from '../../types/funnel';
import { useFunnelStore } from '../../stores/useFunnelStore';
import type { GenerateImageRequest } from '@/pages/generate/types/GenerateType';
import { ROUTES } from '@/routes/paths';
import { useCreditGuard } from '@/shared/hooks/useCreditGuard';

// 타입 가드 함수(타입 단언 사용 X)
// 유효한 '주요활동' 카테고리 내의 값인지 체크
const isValidActivityKey = (
  usage: string
): usage is keyof typeof MAIN_ACTIVITY_VALIDATION.combinationRules => {
  // usage is SomeType
  // 이 함수가 true를 반환할 때는 호출부에서 usage를 SomeType으로 간주해도 된다는 것을 TS에게 알려줌
  return usage in MAIN_ACTIVITY_VALIDATION.combinationRules;
  // usage in _: 객체에 해당 key가 있는지 검사, boolean 반환
};

// interface FormErrors {
//   primaryUsage?: string;
//   bedType?: string;
//   otherFurnitures?: string;
// }

export const useActivityInfo = (context: ImageSetupSteps['ActivityInfo']) => {
  const navigate = useNavigate();

  // Zustand store에서 상태 가져오기
  const {
    activityInfo: activityInfo,
    setActivityInfoData: setActivityInfoData,
    setCurrentStep,
  } = useFunnelStore();

  // 크레딧 가드 훅 (이미지 생성 시 1크레딧 필요)
  const { checkCredit, isChecking } = useCreditGuard(1);

  // 버튼 비활성화 상태 (토스트 표시 후 비활성화)
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    setCurrentStep(4);
  }, []);

  // 초기값 설정: funnel의 context보다 zustand store 우선
  const [localFormData, setLocalFormData] = useState({
    primaryUsage: activityInfo.primaryUsage || context.primaryUsage,
    bedTypeId: activityInfo.bedTypeId || context.bedTypeId,
    otherFurnitureIds:
      activityInfo.otherFurnitureIds || context.otherFurnitureIds || [],
  });

  // TODO: 코드 확인
  const updateFormData = useCallback(
    (updater: any) => {
      const newData =
        typeof updater === 'function' ? updater(localFormData) : updater;

      setLocalFormData(newData);
      setActivityInfoData(newData); // Zustand 동시 업데이트
    },
    [localFormData, setActivityInfoData]
  );

  //   const [errors, setErrors] = useState<FormErrors>({});

  // 주요활동(휴식형, 재택근무형 등) 변경 시 useEffect() 실행
  // 선택한 주요활동에 매칭되는 필수 가구 자동 선택
  useEffect(() => {
    // 필수 가구 체크
    const requiredFurnitures = getRequiredFurnitureIds();
    setLocalFormData((prev) => ({
      ...prev,
      otherFurnitureIds: requiredFurnitures,
    }));
  }, [localFormData.primaryUsage]);

  // 현재 선택된 활동의 필수 가구 ID 리스트 반환
  const getRequiredFurnitureIds = (): number[] => {
    if (
      !localFormData.primaryUsage ||
      !isValidActivityKey(localFormData.primaryUsage)
    )
      return [];

    // TODO: 코드 리팩토링
    const requiredCodes =
      MAIN_ACTIVITY_VALIDATION.combinationRules[localFormData.primaryUsage]
        ?.requiredFurnitures || [];

    return requiredCodes
      .map((code) => {
        const option = Object.values(
          MAIN_ACTIVITY_OPTIONS.OTHER_FURNITURES
        ).find((option) => option.code === code);
        return option?.id;
      })
      .filter((id): id is number => id !== undefined);
  };

  // 현재 선택된 활동의 label 가져오기(휴식형, 재택근무형, 영화감상형, 홈카페형)
  const getCurrentActivityLabel = (): string => {
    if (!localFormData.primaryUsage) return '';
    const option = Object.values(MAIN_ACTIVITY_OPTIONS.PRIMARY_USAGE).find(
      (option) => option.code === localFormData.primaryUsage
    );
    return option?.label || '';
  };

  // 현재 선택된 활동의 필수 가구들의 label 가져오기(책상, 옷장, 식탁/의자, 소파 등)
  // 필수 가구가 여러 개인 경우도 처리 가능
  const getRequiredFurnitureLabels = (): string[] => {
    const requiredIds = getRequiredFurnitureIds();
    return requiredIds
      .map((id) => {
        const option = Object.values(
          MAIN_ACTIVITY_OPTIONS.OTHER_FURNITURES
        ).find((option) => option.id === id);
        return option?.label || '';
      })
      .filter((label) => label !== '');
  };

  // 특정 가구가 현재 활동의 필수 가구인지 확인
  const isRequiredFurniture = (furniture: string | number): boolean => {
    const requiredIds = getRequiredFurnitureIds();
    // useId={true}인 경우 number로 비교, 아닌 경우 code로 비교
    return requiredIds.includes(furniture as number);
  };

  const isFormCompleted = !!(
    localFormData.primaryUsage &&
    localFormData.bedTypeId &&
    Array.isArray(localFormData.otherFurnitureIds) &&
    localFormData.otherFurnitureIds.length > 0
  );

  const handleOnClick = async () => {
    // 중복 클릭 방지 (CreditBox 패턴)
    if (isChecking || isButtonDisabled) return;

    // 타입 단언(as) 대신 사용
    if (!localFormData.primaryUsage || !localFormData.bedTypeId) {
      console.error('필수 필드가 누락되었습니다');
      return;
    }

    // 이미지 생성 전 크레딧 확인
    const hasCredit = await checkCredit();
    if (!hasCredit) {
      console.log('크레딧이 부족하여 이미지 생성을 중단합니다');
      setIsButtonDisabled(true); // 크레딧 부족 시 버튼 비활성화
      return;
    }

    // 디버깅용
    const payload = {
      houseType: context.houseType,
      roomType: context.roomType,
      areaType: context.areaType,
      houseId: context.houseId,
      floorPlan: {
        floorPlanId: context.floorPlan.floorPlanId,
        isMirror: context.floorPlan.isMirror,
      },
      moodBoardIds: context.moodBoardIds,
      primaryUsage: localFormData.primaryUsage,
      bedTypeId: localFormData.bedTypeId,
      otherFurnitureIds: localFormData.otherFurnitureIds,
    };
    console.log('선택된 퍼널 페이로드:', payload);

    const generateImageRequest: GenerateImageRequest = {
      houseId: context.houseId,
      equilibrium: context.areaType,
      floorPlan: {
        floorPlanId: context.floorPlan.floorPlanId,
        isMirror: context.floorPlan.isMirror,
      },
      moodBoardIds: context.moodBoardIds,
      // TODO: 주요활동, 침대, 그 외 가구들 ID값
      activity: localFormData.primaryUsage,
      bedId: localFormData.bedTypeId,
      selectiveIds: localFormData.otherFurnitureIds,
    };

    navigate(ROUTES.GENERATE, { state: { generateImageRequest } });
  };

  return {
    localFormData,
    setFormData: updateFormData,
    // errors,
    isFormCompleted,
    isRequiredFurniture,
    getCurrentActivityLabel,
    getRequiredFurnitureLabels,
    handleOnClick,
    isButtonActive: !isChecking && !isButtonDisabled, // CreditBox 패턴과 동일
  };
};
