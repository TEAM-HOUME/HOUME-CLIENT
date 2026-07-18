import { useEffect, useRef } from 'react';

import { useFunnelStore } from '@store/useFunnelStore';
import { useImageFlowStore } from '@store/useImageFlowStore';

import { TOAST_TYPE, TOASTER_ID } from '@shared/types/toast';

import type { ExploreHouseTemplateItemResponse } from '@apis/__generated__/data-contracts';

import { useToast } from '@components/v2/toast/useToast';

import { TOAST_MESSAGE } from '@constants/toastMessage';

import { useHouseTemplateDetailQuery } from '../apis/queries/useHouseTemplateDetailQuery';
import { useHouseTemplatesQuery } from '../apis/queries/useHouseTemplatesQuery';
import {
  getRecentFloorPlanForAnalytics,
  useRecentFloorPlanQuery,
} from '../apis/queries/useRecentFloorPlanQuery';
import { FILTER_CATEGORIES } from '../constants/floorPlanFilters';
import { useFloorPlanRatioStore } from '../stores/useFloorPlanRatioStore';
import { useFloorPlanStore } from '../stores/useFloorPlanStore';

import type {
  CompletedFloorPlanSelect,
  ImageSetupSteps,
} from '../../types/funnel/steps';

const EMPTY_FLOOR_PLANS: ExploreHouseTemplateItemResponse[] = [];

export const useFloorPlanSelect = (
  _context: ImageSetupSteps['FloorPlanSelect'],
  onNext: (data: CompletedFloorPlanSelect) => void
) => {
  const store = useFloorPlanStore();
  // 비율은 별도 sessionStorage persist 스토어 — 퍼널 이탈/OAuth 리로드에도 탭 세션 동안 유지
  const { aspectRatio, setAspectRatio } = useFloorPlanRatioStore();
  const { notify } = useToast();

  // 도면 전체 조회 (필터 변경 시 자동 refetch — queryKey에 appliedFilters 포함)
  const { data: houseTemplatesData, isFetched: isHouseTemplatesFetched } =
    useHouseTemplatesQuery(store.appliedFilters);
  const floorPlans = houseTemplatesData?.floorPlans ?? EMPTY_FLOOR_PLANS;
  // isExact=false: 필터에 정확 매칭 도면이 없어 서버가 비슷한 도면으로 대체 응답 → '이런 공간은 어떠세요?' UI로 분기
  // undefined일 때는 정상 그리드 fallback (응답 일관성 깨지거나 필드 누락 시 안전)
  const isExact = houseTemplatesData?.isExact !== false;

  // 도면 상세 조회 (카드 선택 -> floorPlanId가 null이 아닐 때 쿼리 enabled)
  const { data: detailData } = useHouseTemplateDetailQuery(
    store.selectedFloorPlanId
  );
  const selectedFloorPlanName = detailData?.floorPlanName ?? '';
  const selectedEquilibrium = detailData?.equilibrium ?? '';
  const selectedDetailViews = detailData?.floorPlans ?? []; // [{imageUrl, view}]

  // 최근 사용 도면 조회 (RecentSheet 용도)
  const { data: recentFloorPlanData, isFetched: isRecentFloorPlanFetched } =
    useRecentFloorPlanQuery();
  const recentFloorPlan = getRecentFloorPlanForAnalytics(recentFloorPlanData);

  // 시트 자동 오픈 우선순위 (마운트 시 1회 평가):
  // 1순위: useFunnelStore에 저장된 도면 → 그 도면 시트 복원 (로그인 복귀 등)
  // 2순위: 홈에서 미리 고른 도면(preset) → 그 도면 시트 오픈 (consumeFloorPlanPreset로 꺼내면 비워짐)
  // 3순위: 최근 사용 도면(API 응답) → RecentSheet 오픈 (아래 별도 effect, 위에서 시트가 안 열렸을 때만)
  // 그 외: 자동 오픈 없음
  useEffect(() => {
    const savedFloorPlan = useFunnelStore.getState().floorPlan;
    if (savedFloorPlan) {
      // floorPlanViewIndex는 isMultiView 도면의 swiper 위치 복원용
      // 이전 sessionStorage 데이터에 해당 필드가 없을 수 있어 ?? 0 fallback
      store.restoreFloorPlan(
        savedFloorPlan.floorPlanId,
        savedFloorPlan.isMirror,
        savedFloorPlan.floorPlanViewIndex ?? 0
      );
      store.openFloorPlanSheet();
      return;
    }

    // 홈에서 도면을 미리 골라 들어온 경우: 그 도면 id를 꺼내(꺼내면 비워짐) 시트를 열어준다
    const presetFloorPlanId = useImageFlowStore
      .getState()
      .consumeFloorPlanPreset();
    if (presetFloorPlanId != null) {
      store.selectNewFloorPlan(presetFloorPlanId);
      store.openFloorPlanSheet();
    }
    // 마운트 시 1회만 평가
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // RecentSheet 자동 오픈: FloorPlanSheet가 자동 오픈되지 않은 모든 경로에서 표시
  // recentFloorPlan이 캐시된 상태로 진입하면 위 useEffect와 같은 mount commit에서 함께 실행되는데,
  // 그때 `store` 변수는 첫 렌더의 snapshot이라 위 effect의 openFloorPlanSheet()가 반영되지 않음.
  // -> useFloorPlanStore.getState()로 zustand에서 동기적으로 최신값을 읽어 race condition 방지!
  const recentHandledRef = useRef(false);
  useEffect(() => {
    if (recentHandledRef.current) return;
    if (!recentFloorPlan) return;
    if (useFloorPlanStore.getState().isFloorPlanSheetOpen) return;

    recentHandledRef.current = true;

    // 최근 실제로 사용한 뷰(isRecentUsedView)를 기본 선택으로 열기 (없으면 첫 뷰)
    const recentUsedIndex = (recentFloorPlan.floorPlans ?? []).findIndex(
      (view) => view.isRecentUsedView
    );
    store.setViewIndex(recentUsedIndex >= 0 ? recentUsedIndex : 0);

    store.openRecentSheet();
    notify({
      text: TOAST_MESSAGE.RECENT_FLOOR_PLAN_LOADED,
      type: TOAST_TYPE.INFO,
      options: { toasterId: TOASTER_ID.TOP_4 },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentFloorPlan]);

  // 로그인 게이트 복귀 등으로 도면 상세가 새로 fetch될 때, funnelStore에 저장된 floorPlanView와
  // 일치하는 슬라이드 인덱스를 복원해 사용자가 이전에 보던 도면 view가 그대로 노출되도록 함
  // floorPlanId가 일치할 때만 복원 — 다른 도면이 같은 view 라벨을 가진 경우 의도치 않게 강제 복원되는 것을 방지
  useEffect(() => {
    const saved = useFunnelStore.getState().floorPlan;
    if (!saved?.floorPlanView || !detailData?.floorPlans) return;
    if (saved.floorPlanId !== detailData.floorPlanId) return;

    const idx = detailData.floorPlans.findIndex(
      (p) => p.view === saved.floorPlanView
    );
    if (idx >= 0) store.setViewIndex(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailData]);

  const handleCardClick = (floorPlanId: number) => {
    store.selectNewFloorPlan(floorPlanId);
    store.openFloorPlanSheet();
  };

  // 도면 선택 후 바텀시트 "공간 선택하기" CTA
  const handleConfirmFloorPlan = () => {
    if (store.selectedFloorPlanId === null) return;

    // 도면 swiper에서 사용자가 선택한 view(ex: 창가뷰)를 string으로 가져옴
    const floorPlanView =
      selectedDetailViews[store.selectedViewIndex]?.view ?? '';

    // 다음 스텝으로 이동 시에 전달할 데이터 (API payload에 필요한 필드만)
    const floorPlanData: CompletedFloorPlanSelect['floorPlan'] = {
      floorPlanId: store.selectedFloorPlanId,
      isMirror: store.isMirror,
      floorPlanView,
    };

    // useFunnelStore에는 UI 복원용 floorPlanViewIndex까지 함께 저장
    useFunnelStore.getState().setFloorPlan({
      ...floorPlanData,
      floorPlanViewIndex: store.selectedViewIndex,
    });
    onNext({ floorPlan: floorPlanData });
  };

  // 최근 생성 공간 바텀시트 "공간 선택하기" CTA
  const handleConfirmRecentFloorPlan = () => {
    if (!recentFloorPlan?.floorPlanId) return;
    store.closeRecentSheet();

    // 최근 생성한 도면도 multi-view 가능 → 사용자가 선택한 view 반영
    const floorPlanView =
      (recentFloorPlan.floorPlans ?? [])[store.selectedViewIndex]?.view ?? '';

    const floorPlanData: CompletedFloorPlanSelect['floorPlan'] = {
      floorPlanId: recentFloorPlan.floorPlanId,
      isMirror: store.isMirror,
      floorPlanView,
    };
    useFunnelStore.getState().setFloorPlan({
      ...floorPlanData,
      floorPlanViewIndex: store.selectedViewIndex,
    });
    onNext({ floorPlan: floorPlanData });
  };

  return {
    filterCategories: FILTER_CATEGORIES,
    floorPlans,
    isExact,
    isHouseTemplatesFetched,
    selectedFloorPlanName,
    selectedEquilibrium,
    selectedDetailViews,
    recentFloorPlan,
    isRecentFloorPlanFetched,
    handleCardClick,
    handleConfirmFloorPlan,
    handleConfirmRecentFloorPlan,

    // 필터 그리드에서 사용하는 상태/액션
    grid: {
      appliedFilters: store.appliedFilters,
      onFilterChipClick: store.openFilterSheet,
      onFilterChipClear: store.clearAppliedFilter,
      aspectRatio,
      onAspectRatioChange: setAspectRatio,
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
