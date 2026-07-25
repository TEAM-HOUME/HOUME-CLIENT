import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { trackSelectFurnitureBtnCtaClick } from '@pages/imageSetup/analytics/selectFurnitureAnalytics';

import { ROUTES } from '@routes/paths';

import { useFunnelStore } from '@store/useFunnelStore';

import {
  buildSelectedFurnitureChips,
  captureFullFunnelFlowSnapshot,
} from '@shared/analytics/utils/imageFlow';

import { useCreditGuard } from '@hooks/useCreditGuard';

import { useActivitySelection } from './useActivitySelection';
import { useCategorySelection } from './useCategorySelection';
import { useGlobalConstraints } from './useGlobalConstraints';
import { useActivitiesQuery } from '../../apis/queries/useActivitiesQuery';
import { useFurnitureCategoriesQuery } from '../../apis/queries/useFurnitureCategoriesQuery';
import { CATEGORY_SELECTION_MODE } from '../../types/funnel/activityInfo';
import { useRecentFloorPlanQuery } from '../../v2/apis/queries/useRecentFloorPlanQuery';

import type { CategorySelectionAnalyticsCallbacks } from './useCategorySelection';
import type { ActivityInfoFormData } from '../../types/funnel/activityInfo';
import type { ImageSetupSteps } from '../../types/funnel/steps';

interface UseActivityInfoOptions {
  categoryAnalytics?: CategorySelectionAnalyticsCallbacks;
}

/**
 * - 주요활동/가구 카테고리 쿼리 호출
 * - 사용자 입력값 관리 (formData 상태 + Zustand persist)
 * - 주요활동 선택 / 카테고리별 가구 토글 / 전역 제약 훅 위임
 * - 활동 변경 시 가구 초기화 + 필수 가구 자동 선택
 * - 제출(크레딧 체크 → sessionStorage → /generate)
 */
export const useActivityInfo = (
  context: ImageSetupSteps['ActivityInfo'],
  options?: UseActivityInfoOptions
) => {
  const navigate = useNavigate();

  // 크레딧 가드 훅 (이미지 생성 시 1크레딧 필요)
  const { checkCredit, isChecking } = useCreditGuard(1);
  // 버튼 비활성화 상태 (토스트 표시 후 비활성화)
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // 서버 데이터 — 활동 목록 + 가구 카테고리 (두 쿼리 독립 호출)
  const {
    data: activitiesData,
    isPending: isActivitiesPending,
    isError: isActivitiesError,
    refetch: refetchActivities,
  } = useActivitiesQuery();
  const {
    data: categoriesData,
    isPending: isCategoriesPending,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useFurnitureCategoriesQuery();

  const { data: recentFloorPlanData } = useRecentFloorPlanQuery();

  // 둘 중 하나라도 pending/error면 전체가 pending/error
  const isPending = isActivitiesPending || isCategoriesPending;
  const isError = isActivitiesError || isCategoriesError;
  const refetch = () => {
    if (isActivitiesError) refetchActivities();
    if (isCategoriesError) refetchCategories();
  };

  // Zustand store에서 저장된 데이터
  const savedActivityInfo = useFunnelStore((state) => state.activityInfo);

  // 초기값 설정: Zustand에 값이 있으면 사용, 없으면 context 사용
  const [formData, setFormData] = useState<ActivityInfoFormData>({
    activity: savedActivityInfo?.activity ?? context.activity,
    furnitureIds: savedActivityInfo?.furnitureIds ?? context.furnitureIds ?? [],
  });

  // ActivityInfo는 마지막 스텝이므로 formData가 변경될 때마다 실시간으로 persist 저장
  useEffect(() => {
    useFunnelStore.getState().setActivityInfo({
      activity: formData.activity,
      furnitureIds: formData.furnitureIds,
    });
  }, [formData.activity, formData.furnitureIds]);

  // 주요활동 선택 훅 — 활동 객체 + 필수 가구 추출 담당
  const activitySelection = useActivitySelection(
    activitiesData?.activities,
    formData.activity
  );

  // 전역 제약조건 훅 (최대 6개 + 필수 가구 보호)
  const globalConstraints = useGlobalConstraints(
    formData.furnitureIds,
    activitySelection.getRequiredFurnitureIds(),
    !!formData.activity
  );

  // 카테고리별 가구 선택 훅 (nameEng 기반 매핑 — 백엔드 응답 순서/추가에 영향 없음)
  const categories = categoriesData?.categories;
  const findByNameEng = (name: string) =>
    categories?.find((c) => c.nameEng === name) ?? null;

  const buildChips = (furnitureIds: number[]) =>
    buildSelectedFurnitureChips(furnitureIds, categories);

  const categoryAnalytics = options?.categoryAnalytics;

  const bed = useCategorySelection(
    findByNameEng('BED'),
    CATEGORY_SELECTION_MODE.BED,
    formData,
    setFormData,
    globalConstraints,
    buildChips,
    categoryAnalytics
  );
  const sofa = useCategorySelection(
    findByNameEng('SOFA'),
    CATEGORY_SELECTION_MODE.SOFA,
    formData,
    setFormData,
    globalConstraints,
    buildChips,
    categoryAnalytics
  );
  const storage = useCategorySelection(
    findByNameEng('STORAGE'),
    CATEGORY_SELECTION_MODE.STORAGE,
    formData,
    setFormData,
    globalConstraints,
    buildChips,
    categoryAnalytics
  );
  const table = useCategorySelection(
    findByNameEng('TABLE'),
    CATEGORY_SELECTION_MODE.TABLE,
    formData,
    setFormData,
    globalConstraints,
    buildChips,
    categoryAnalytics
  );
  const selective = useCategorySelection(
    findByNameEng('SELECTIVE'),
    CATEGORY_SELECTION_MODE.SELECTIVE,
    formData,
    setFormData,
    globalConstraints,
    buildChips,
    categoryAnalytics
  );
  const lighting = useCategorySelection(
    findByNameEng('LIGHTING'),
    CATEGORY_SELECTION_MODE.LIGHTING,
    formData,
    setFormData,
    globalConstraints,
    buildChips,
    categoryAnalytics
  );

  // 카테고리 선택 객체 구성
  const categorySelections = categoriesData
    ? { bed, sofa, storage, table, selective, lighting }
    : null;

  // 선택된 주요 활동의 라벨
  const selectedActivityLabel = activitySelection.selectedActivityItem?.label;

  // 타입 가드: 완료된 데이터인지 확인
  const isCompleteActivityInfo = (
    data: ActivityInfoFormData
  ): data is Required<ActivityInfoFormData> => {
    return !!(
      data.activity &&
      Array.isArray(data.furnitureIds) &&
      data.furnitureIds.length > 0
    );
  };

  // 입력값 완료 여부 확인
  const isFormCompleted = isCompleteActivityInfo(formData);

  // 주요활동 변경 시 기존 가구 초기화 후 필수 가구 자동 선택
  useEffect(() => {
    // Zustand에 저장된 데이터가 있으면 해당 데이터 유지 (복원 케이스 스킵)
    if (savedActivityInfo?.activity === formData.activity) {
      return;
    }

    if (formData.activity) {
      const requiredIds = activitySelection.getRequiredFurnitureIds();
      setFormData((prev) => ({
        ...prev,
        furnitureIds: requiredIds,
      }));
    } else {
      // 주요활동이 해제된 경우 모든 가구 선택 해제
      setFormData((prev) => ({
        ...prev,
        furnitureIds: [],
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.activity, savedActivityInfo]);

  // 제출 핸들러
  const handleSubmit = async () => {
    if (!isFormCompleted) return;

    // 중복 클릭 방지
    if (isChecking || isButtonDisabled) return;

    // 이미지 생성 전 크레딧 확인
    const hasCredit = await checkCredit();
    if (!hasCredit) {
      setIsButtonDisabled(true);
      return;
    }

    // payload 조립 + 다음 페이지(LoadingPage)로 데이터 전달은 useGenerateImageRequest 훅이 담당
    const funnelState = useFunnelStore.getState();
    const furnitureChipCodes = buildChips(formData.furnitureIds);

    captureFullFunnelFlowSnapshot({
      floorPlanId: funnelState.floorPlan?.floorPlanId,
      moodBoardIds: funnelState.moodBoardIds ?? undefined,
      activityCode: formData.activity,
      furnitureChipCodes,
    });

    trackSelectFurnitureBtnCtaClick({
      chips: furnitureChipCodes,
      activityCode: formData.activity,
      hasPreviousImage: recentFloorPlanData?.hasRecentImage === true,
    });

    navigate(ROUTES.GENERATE);
  };

  return {
    // 서버 데이터 상태
    isPending,
    isError,
    refetch,

    // 폼 상태
    formData,
    setFormData,
    isFormCompleted,

    // 주요활동 관련
    activitySelection,
    selectedActivityLabel,
    getRequiredFurnitureLabels: activitySelection.getRequiredFurnitureLabels,

    // 활동 목록 (바텀시트용)
    activities: activitiesData?.activities ?? [],

    // 가구 카테고리 데이터, 선택 상태
    categories: categoriesData?.categories ?? [],
    categorySelections,

    // 전역 제약조건
    globalConstraints,

    // 액션
    handleSubmit,
  };
};
