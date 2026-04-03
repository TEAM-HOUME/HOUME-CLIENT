import { useEffect } from 'react';

import { useToast } from '@components/toast/useToast';

import { useFunnelStore } from '../../stores/useFunnelStore';
import {
  DUMMY_FILTER_CATEGORIES,
  DUMMY_FLOOR_PLAN_DETAILS,
  DUMMY_FLOOR_PLANS,
  DUMMY_RECENT_FLOOR_PLAN,
} from '../constants/floorPlanDummy';
import { useFloorPlanStore } from '../stores/useFloorPlanStore';

import type {
  CompletedFloorPlanSelect,
  ImageSetupSteps,
} from '../../types/funnel/steps';
import type { FloorPlanFilters, RecentFloorPlanData } from '../types/floorPlan';

export const useFloorPlanSelect = (
  _context: ImageSetupSteps['FloorPlanSelect'],
  onNext: (data: CompletedFloorPlanSelect) => void
) => {
  const store = useFloorPlanStore();
  const { notify } = useToast();

  // 더미 데이터 (추후 useFloorPlanQuery / useRecentFloorPlanQuery로 교체)
  const filterCategories = DUMMY_FILTER_CATEGORIES;
  const allFloorPlans = DUMMY_FLOOR_PLANS;
  // 최근 생성 도면 (별도 API 응답)
  const recentFloorPlan: RecentFloorPlanData | null = DUMMY_RECENT_FLOOR_PLAN;

  // 최근 생성 공간이 있으면 초기 시트 표시 + 토스트 알림
  useEffect(() => {
    // 1순위: useFunnelStore에 저장된 도면이 있는 경우 (case: 경로 3 홈 도면 클릭 / 로그인 게이트에서 복귀)
    const savedFloorPlan = useFunnelStore.getState().floorPlan;
    if (savedFloorPlan) {
      store.restoreFloorPlan(
        savedFloorPlan.floorPlanId,
        savedFloorPlan.isMirror
      );
      store.openFloorPlanSheet();
      return;
    }

    // 2순위: 최근 생성 공간이 있는 경우 (case: API 응답에 최근 생성 공간 O)
    // TODO: 최근 생성 공간 API 연동 시 RecentSheet에 해당 도면을 띄우도록 데이터 전달해야 함
    if (recentFloorPlan) {
      store.openRecentSheet();
      notify({ text: '저장된 내 공간을 불러왔어요.' });
    }

    // 마운트 시 1회만 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // TODO: API 연동 후에는 불필요한 함수
  const matchesFilter = (selected: string[], value: string): boolean =>
    selected.length === 0 || selected.includes(value);

  // TODO: API 연동 후 서버 필터링으로 전환 (API 연동 후에는 불필요한 함수)
  const filteredFloorPlans = allFloorPlans.filter((plan) => {
    const f: FloorPlanFilters = store.appliedFilters;
    return (
      matchesFilter(f.residenceType, plan.residenceType) &&
      matchesFilter(f.layoutType, plan.layoutType) &&
      matchesFilter(f.areaSize, plan.areaSize)
    );
  });

  // TODO: API 연동 시 도면 상세 조회 API(GET /explore/house-templates/{id})로 교체
  // selectedFloorPlan, selectedDetailViews 모두 하나의 API 응답에서 추출
  const selectedFloorPlan =
    allFloorPlans.find((p) => p.id === store.selectedFloorPlanId) ?? null;

  const selectedDetailViews = store.selectedFloorPlanId
    ? (DUMMY_FLOOR_PLAN_DETAILS[store.selectedFloorPlanId] ?? [])
    : [];

  /**
   * handleConfirmFloorPlan / handleConfirmRecentFloorPlan에서
   * payload 생성 + funnelStore 저장 로직이 동일하므로 헬퍼로 추출
   */
  const confirmFloorPlan = (
    floorPlanData: CompletedFloorPlanSelect['floorPlan']
  ) => {
    useFunnelStore.getState().setFloorPlan(floorPlanData);
    onNext({ floorPlan: floorPlanData });
  };

  const handleCardClick = (floorPlanId: number) => {
    store.selectNewFloorPlan(floorPlanId);
    store.openFloorPlanSheet();
  };

  // 도면 선택 후 "공간 선택하기" CTA
  const handleConfirmFloorPlan = () => {
    if (!selectedFloorPlan) return;
    confirmFloorPlan({
      floorPlanId: selectedFloorPlan.id,
      isMirror: store.isMirror,
    });
  };

  // 최근 생성 공간 바텀시트 "선택 완료" CTA
  const handleConfirmRecentFloorPlan = () => {
    if (!recentFloorPlan) return;
    store.closeRecentSheet();
    confirmFloorPlan({
      floorPlanId: recentFloorPlan.id,
      isMirror: store.isMirror,
    });
  };

  // 컴포넌트별로 필요한 상태/액션을 묶어서 반환
  return {
    filterCategories,
    filteredFloorPlans,
    selectedFloorPlan,
    selectedDetailViews,
    recentFloorPlan,
    handleCardClick,
    handleConfirmFloorPlan,
    handleConfirmRecentFloorPlan,

    // 필터 그리드에서 사용하는 상태/액션
    grid: {
      appliedFilters: store.appliedFilters,
      onFilterChipClick: store.openFilterSheet,
      onFilterChipClear: store.clearAppliedFilter,
    },

    // FilterSheet props
    filterSheet: {
      open: store.isFilterSheetOpen,
      onClose: store.closeFilterSheet,
      pendingFilters: store.pendingFilters,
      onFilterChange: store.setPendingFilter,
      onApply: () => {
        store.applyFilters();
        store.closeFilterSheet();
      },
      onReset: store.resetFilters,
    },

    // FloorPlanSheet (도면 상세) props
    floorPlanSheet: {
      open: store.isFloorPlanSheetOpen,
      onClose: store.closeFloorPlanSheet,
    },

    // FloorPlanSheet (최근 공간) props
    recentSheet: {
      open: store.isRecentSheetOpen,
      onClose: store.closeRecentSheet,
    },
  };
};
