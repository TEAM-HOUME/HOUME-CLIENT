import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import type { GenerateImageRequest } from '@/pages/generate/types/generate';
import { ROUTES } from '@/routes/paths';
import { useCreditGuard } from '@/shared/hooks/useCreditGuard';

import { useActivitySelection } from './useActivitySelection';
import { useCategorySelection } from './useCategorySelection';
import { useGlobalConstraints } from './useGlobalConstraints';

import type { ActivityOptionsResponse } from '../../types/apis/activityInfo';
import type { ActivityInfoFormData } from '../../types/funnel/activityInfo';
import type { ImageSetupSteps } from '../../types/funnel/steps';

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
    activitySelection.getRequiredFurnitureIds(),
    !!formData.activityType
  );

  // 각 카테고리별 가구 선택 훅(for문 안에서는 훅 호출 불가)
  const bed = useCategorySelection(
    activityOptionsData?.categories[0] || null,
    formData,
    setFormData,
    globalConstraints
  );
  const sofa = useCategorySelection(
    activityOptionsData?.categories[1] || null,
    formData,
    setFormData,
    globalConstraints
  );
  const storage = useCategorySelection(
    activityOptionsData?.categories[2] || null,
    formData,
    setFormData,
    globalConstraints
  );
  const table = useCategorySelection(
    activityOptionsData?.categories[3] || null,
    formData,
    setFormData,
    globalConstraints
  );
  const selective = useCategorySelection(
    activityOptionsData?.categories[4] || null,
    formData,
    setFormData,
    globalConstraints
  );

  // 카테고리 선택 객체 구성
  const categorySelections = activityOptionsData
    ? { bed, sofa, storage, table, selective }
    : null;

  const selectedActivityLabel = activityOptionsData?.activities.find(
    (activity) => activity.code === formData.activityType
  )?.label;
  // 선택된 활동의 필수 가구 라벨들을 반환하는 메서드
  const getRequiredFurnitureLabels = (): string[] => {
    if (!formData.activityType || !activityOptionsData) return [];

    const requiredIds = activitySelection.getRequiredFurnitureIds();
    const labels: string[] = [];

    for (const category of activityOptionsData.categories) {
      for (const furniture of category.furnitures) {
        if (requiredIds.includes(furniture.id)) {
          labels.push(furniture.label);
        }
      }
    }

    return labels;
  };

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

  // 주요활동 변경 시 기존 가구 초기화 후 필수 가구 자동 선택
  useEffect(() => {
    if (formData.activityType) {
      const requiredIds = activitySelection.getRequiredFurnitureIds();
      setFormData((prev) => ({
        ...prev,
        selectiveIds: requiredIds,
      }));
    } else {
      // 주요활동이 해제된 경우 모든 가구 선택 해제
      setFormData((prev) => ({
        ...prev,
        selectiveIds: [],
      }));
    }
  }, [formData.activityType]);

  // 입력값 완료 여부 확인
  const isFormCompleted = isCompleteActivityInfo(formData);

  // 제출 핸들러
  const handleSubmit = async () => {
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

    navigate(ROUTES.GENERATE, { state: { generateImageRequest } });
  };

  return {
    // 상태
    formData,
    setFormData,
    isFormCompleted,

    // 주요활동 관련
    activitySelection,
    selectedActivityLabel,
    getRequiredFurnitureLabels,

    // 가구 카테고리 선택 관련
    categorySelections,

    // 전역 제약조건
    globalConstraints,

    // 액션
    handleSubmit,
  };
};
