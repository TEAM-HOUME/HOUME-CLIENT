import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import type { GenerateImageRequest } from '@/pages/generate/types/generate';
import { ROUTES } from '@/routes/paths';
import { useCreditGuard } from '@/shared/hooks/useCreditGuard';

import { useActivitySelection } from './useActivitySelection';
import { useFurnitureSelection } from './useFurnitureSelection';
import { useGlobalConstraints } from './useGlobalConstraints';

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

  // 크레딧 가드 훅 (이미지 생성 시 1크레딧 필요)
  const { checkCredit, isChecking } = useCreditGuard(1);
  // 버튼 비활성화 상태 (토스트 표시 후 비활성화)
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // funnel의 context값으로 초기값 설정
  const [formData, setFormData] = useState<ActivityInfoFormData>({
    activityType: context.activityType,
    selectiveIds: context.selectiveIds || [],
  });

  const [errors, setErrors] = useState<ActivityInfoErrors>({});

  // 주요활동 선택 훅
  const activitySelection = useActivitySelection(
    activityOptionsData,
    formData.activityType,
    (activityType) => {
      setFormData((prev) => ({ ...prev, activityType: activityType }));
    }
  );

  // 전역 제약조건 훅
  const globalConstraints = useGlobalConstraints(
    formData.selectiveIds,
    activitySelection.getRequiredFurnitureIds()
  );

  // 가구 선택 훅
  const furnitureSelection = useFurnitureSelection(
    formData.selectiveIds,
    (selectiveIds) => {
      setFormData((prev) => ({ ...prev, selectiveIds }));
    },
    globalConstraints
  );

  // 타입 가드: 완료된 데이터인지 확인
  const isCompleteActivityInfo = (
    data: ActivityInfoFormData
  ): data is Required<ActivityInfoFormData> => {
    return !!(
      data.activityType &&
      Array.isArray(data.selectiveIds) &&
      data.selectiveIds.length > 0
    );
  };

  // 에러 상태 관리
  useEffect(() => {
    setErrors((prev) => {
      if (prev.activityType) {
        const { activityType, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, [formData.activityType]);

  useEffect(() => {
    setErrors((prev) => {
      if (prev.selectiveIds) {
        const { selectiveIds, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, [formData.selectiveIds]);

  // 주요활동 변경 시 필수 가구 자동 선택
  useEffect(() => {
    if (formData.activityType) {
      const requiredIds = activitySelection.getRequiredFurnitureIds();
      const updatedIds = globalConstraints.applyConstraints([...requiredIds]);
      setFormData((prev) => ({
        ...prev,
        selectiveIds: updatedIds,
      }));
    }
  }, [formData.activityType, activitySelection, globalConstraints]);

  // 입력값 완료 여부 확인
  const isFormCompleted =
    isCompleteActivityInfo(formData) && Object.values(errors).length === 0;

  // 제출 핸들러
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
      activity: formData.activityType!,
      selectiveIds: formData.selectiveIds!,
    };

    onNext({
      houseType: context.houseType,
      roomType: context.roomType,
      areaType: context.areaType,
      houseId: context.houseId,
      floorPlan: context.floorPlan,
      moodBoardIds: context.moodBoardIds,
      activityType: formData.activityType!,
      selectiveIds: formData.selectiveIds!,
    });

    navigate(ROUTES.GENERATE, { state: { generateImageRequest } });
  };

  return {
    // 상태
    formData,
    setFormData,
    errors,
    isFormCompleted,

    // 주요활동 관련
    activitySelection,

    // 가구 선택 관련
    furnitureSelection,

    // 전역 제약조건
    globalConstraints,

    // 액션
    handleSubmit,
  };
};
