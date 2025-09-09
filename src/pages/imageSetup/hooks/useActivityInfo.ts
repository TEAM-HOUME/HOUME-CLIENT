import { useCallback, useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import type { GenerateImageRequest } from '@/pages/generate/types/generate';
import { ROUTES } from '@/routes/paths';
import { useCreditGuard } from '@/shared/hooks/useCreditGuard';

import { MAIN_ACTIVITY_VALIDATION } from '../types/funnel/validation';

import type { ActivityOptionsResponse } from '../types/apis/activityInfo';
import type {
  ActivityInfoErrors,
  ActivityInfoFormData,
  CompletedActivityInfo,
} from '../types/funnel/activityInfo';
import type { ImageSetupSteps } from '../types/funnel/steps';

export const useActivityInfo = (
  context: ImageSetupSteps['ActivityInfo'],
  activityOptionsData?: ActivityOptionsResponse
) => {
  const navigate = useNavigate();

  // TODO(지성): 크레딧 관련 로직 따로 관리
  // 크레딧 가드 훅 (이미지 생성 시 1크레딧 필요)
  const { checkCredit, isChecking } = useCreditGuard(1);
  // 버튼 비활성화 상태 (토스트 표시 후 비활성화)
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // funnel의 context값으로 초기값 설정
  const [formData, setFormData] = useState<ActivityInfoFormData>({
    primaryUsage: context.activityTypes,
    bedId: context.bedId,
    selectiveIds: context.selectiveIds || [],
  });

  const [errors, setErrors] = useState<ActivityInfoErrors>({});

  // 타입 가드
  // 유효한 '주요활동' 카테고리 내의 값인지 체크
  const isValidActivityKey = (
    usage: string
  ): usage is keyof typeof MAIN_ACTIVITY_VALIDATION.combinationRules => {
    // usage is SomeType
    // 이 함수가 true를 반환할 때는 호출부에서 usage를 SomeType으로 간주해도 된다는 것을 TS에게 알려줌
    return usage in MAIN_ACTIVITY_VALIDATION.combinationRules;
    // usage in _: 객체에 해당 key가 있는지 검사, boolean 반환
  };

  // 타입 가드
  const isCompleteActivityInfo = (
    data: ActivityInfoFormData
  ): data is Required<ActivityInfoFormData> => {
    return !!(
      data.primaryUsage &&
      data.bedId &&
      Array.isArray(data.selectiveIds) &&
      data.selectiveIds.length > 0
    );
  };

  useEffect(() => {
    setErrors((prev) => {
      if (prev.primaryUsage) {
        const { primaryUsage, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, [formData.primaryUsage]);

  useEffect(() => {
    setErrors((prev) => {
      if (prev.bedTypeId) {
        const { bedTypeId, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, [formData.bedId]);

  useEffect(() => {
    setErrors((prev) => {
      if (prev.selectiveIds) {
        const { selectiveIds: selectiveIds, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, [formData.selectiveIds]);

  // 주요활동 변경 시 필수 가구 자동 선택
  useEffect(() => {
    if (formData.primaryUsage) {
      const requiredFurnitures = getRequiredFurnitureIds();
      setFormData((prev) => ({
        ...prev,
        selectiveIds: requiredFurnitures,
      }));
    }
  }, [formData.primaryUsage]);

  // 현재 선택된 활동의 필수 가구 ID 리스트 반환
  const getRequiredFurnitureIds = (): number[] => {
    if (
      !formData.primaryUsage ||
      !isValidActivityKey(formData.primaryUsage) ||
      !activityOptionsData
    )
      return [];

    const requiredCodes =
      MAIN_ACTIVITY_VALIDATION.combinationRules[formData.primaryUsage]
        ?.requiredFurnitures || [];

    return requiredCodes
      .map((code) => {
        const option = activityOptionsData.selectives.items.find(
          (option) => option.code === code
        );
        return option?.id;
      })
      .filter((id): id is number => id !== undefined);
  };

  // 현재 선택된 활동의 label 가져오기(휴식형, 재택근무형, 영화감상형, 홈카페형)
  const getCurrentActivityLabel = (): string => {
    if (!formData.primaryUsage || !activityOptionsData) return '';
    const option = activityOptionsData.activities.find(
      (option) => option.code === formData.primaryUsage
    );
    return option?.label || '';
  };

  // 현재 선택된 활동의 필수 가구들의 label 가져오기(책상, 옷장, 식탁/의자, 소파 등)
  // 필수 가구가 여러 개인 경우도 처리 가능
  const getRequiredFurnitureLabels = (): string[] => {
    if (!activityOptionsData) return [];
    const requiredIds = getRequiredFurnitureIds();
    return requiredIds
      .map((id) => {
        const option = activityOptionsData.selectives.items.find(
          (option) => option.id === id
        );
        return option?.label || '';
      })
      .filter((label) => label !== '');
  };

  // 특정 가구가 현재 활동의 필수 가구인지 확인
  const isRequiredFurniture = (furniture: string | number): boolean => {
    const requiredIds = getRequiredFurnitureIds();
    const furnitureId =
      typeof furniture === 'string' ? parseInt(furniture, 10) : furniture;
    // TODO(지성): 디자인팀 공컴 디자인 완료되면 타입 수정 예정(현재 공컴 props때문에 임시로 string | number로 구현)
    return requiredIds.includes(furnitureId);
  };

  // 입력값 3개 입력 여부 확인 및 에러 상태 확인
  const isFormCompleted =
    isCompleteActivityInfo(formData) && Object.values(errors).length === 0;

  // isFormCompleted == true일 때 버튼 enable, handleSubmit 실행
  const handleSubmit = async (
    onNext: (data: CompletedActivityInfo) => void
  ) => {
    if (!isFormCompleted) return;

    // 중복 클릭 방지 (CreditBox 패턴)
    if (isChecking || isButtonDisabled) return;

    // 이미지 생성 전 크레딧 확인
    const hasCredit = await checkCredit();
    if (!hasCredit) {
      console.log('크레딧이 부족하여 이미지 생성을 중단합니다');
      setIsButtonDisabled(true); // 크레딧 부족 시 버튼 비활성화
      return;
    }

    const generateImageRequest: GenerateImageRequest = {
      houseId: context.houseId,
      equilibrium: context.areaType,
      floorPlan: {
        floorPlanId: context.floorPlan.floorPlanId,
        isMirror: context.floorPlan.isMirror,
      },
      moodBoardIds: context.moodBoardIds,
      activity: formData.primaryUsage!,
      bedId: formData.bedId!,
      selectiveIds: formData.selectiveIds!,
    };

    onNext({
      houseType: context.houseType,
      roomType: context.roomType,
      areaType: context.areaType,
      houseId: context.houseId,
      floorPlan: context.floorPlan,
      moodBoardIds: context.moodBoardIds,
      primaryUsage: formData.primaryUsage!,
      bedTypeId: formData.bedId!,
      selectiveIds: formData.selectiveIds!,
    });

    navigate(ROUTES.GENERATE, { state: { generateImageRequest } });
  };

  return {
    formData,
    setFormData,
    errors,
    handleSubmit,
    isFormCompleted,
    isRequiredFurniture,
    getCurrentActivityLabel,
    getRequiredFurnitureLabels,
  };
};
