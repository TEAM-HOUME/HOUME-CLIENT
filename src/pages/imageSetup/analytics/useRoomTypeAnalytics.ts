import { useCallback, useEffect, useRef } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import {
  getRoomTypePageViewParams,
  setRoomTypeScrollElement,
  trackRoomTypeCardRoomClick,
  trackRoomTypeEmptyListRecCardClick,
  trackRoomTypeEmptyListRecCardView,
  trackRoomTypeFilterSheetDimmedClick,
  trackRoomTypeFilterSheetCloseClick,
  trackRoomTypeFilterSheetReset,
  trackRoomTypeFilterSheetSubmit,
  trackRoomTypeListEmptyView,
  trackRoomTypeListRoomCardView,
  trackRoomTypeViewSheetSubmit,
  trackRoomTypeViewSheetView,
} from '@pages/imageSetup/analytics/roomTypeAnalytics';
import { useFloorPlanSelect } from '@pages/imageSetup/hooks/useFloorPlanSelect';
import { useFloorPlanStore } from '@pages/imageSetup/stores/useFloorPlanStore';
import type {
  CompletedFloorPlanSelect,
  ImageSetupSteps,
} from '@pages/imageSetup/types/funnel/steps';

import { GA_EVENTS } from '@shared/analytics/events';
import {
  useAnalyticsPageView,
  useScrollDepthTrack,
} from '@shared/analytics/hooks';
import { SCREEN_NAME } from '@shared/analytics/screenNames';

import { fetchHouseTemplateDetail } from '@apis/queries/useHouseTemplateDetailQuery';
import { ensureRecentFloorPlanForAnalytics } from '@apis/queries/useRecentFloorPlanQuery';

export const useRoomTypeAnalytics = (
  context: ImageSetupSteps['FloorPlanSelect'],
  onNext: (data: CompletedFloorPlanSelect) => void
) => {
  const queryClient = useQueryClient();
  const gridScrollRef = useRef<HTMLDivElement | null>(null);
  const trackedViewSheetKeyRef = useRef<string | null>(null);

  const setGridScrollRef = useCallback((node: HTMLDivElement | null) => {
    gridScrollRef.current = node;
    setRoomTypeScrollElement(node);
  }, []);

  const floorPlanSelect = useFloorPlanSelect(context, onNext);
  const {
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
    grid,
    filterSheet,
    floorPlanSheet,
    recentSheet,
  } = floorPlanSelect;

  const selectedFloorPlanId = useFloorPlanStore(
    (state) => state.selectedFloorPlanId
  );

  useAnalyticsPageView(
    GA_EVENTS.roomType.PAGE_VIEW,
    SCREEN_NAME.ROOM_TYPE,
    getRoomTypePageViewParams(recentFloorPlan),
    // recentFloorPlan 쿼리 settle 후 발사 — cold cache에서 has_previous_space가 false로 고정되는 것 방지 (Home과 동일)
    { enabled: isRecentFloorPlanFetched }
  );

  useScrollDepthTrack(GA_EVENTS.roomType.PAGE_SCROLL, SCREEN_NAME.ROOM_TYPE, {
    getScrollElement: () => gridScrollRef.current,
  });

  useEffect(() => {
    // houseTemplates 쿼리 settle 전에는 발사 금지 — 로딩 중 floorPlans=[]·isExact=true로 팬텀 listRoomCard_view가 나가는 것 방지
    if (!isHouseTemplatesFetched) return;

    if (isExact) {
      trackRoomTypeListRoomCardView(grid.appliedFilters);
      return;
    }

    const alternativeSpaceIds = floorPlans
      .map((plan) => plan.id)
      .filter((id): id is number => id !== undefined);

    trackRoomTypeListEmptyView(grid.appliedFilters, {
      spaceCount: floorPlans.length,
      alternativeSpaceIds,
    });

    if (alternativeSpaceIds.length > 0) {
      trackRoomTypeEmptyListRecCardView(grid.appliedFilters, {
        spaceCount: floorPlans.length,
        alternativeSpaceIds,
        spaceId: alternativeSpaceIds[0],
      });
    }
  }, [floorPlans, grid.appliedFilters, isExact, isHouseTemplatesFetched]);

  useEffect(() => {
    if (
      floorPlanSheet.open &&
      selectedFloorPlanId &&
      selectedDetailViews.length
    ) {
      const trackKey = `floor-${selectedFloorPlanId}`;
      if (trackedViewSheetKeyRef.current === trackKey) return;

      trackedViewSheetKeyRef.current = trackKey;
      trackRoomTypeViewSheetView({
        floorPlanId: selectedFloorPlanId,
        floorPlanName: selectedFloorPlanName,
        viewCount: selectedDetailViews.length,
      });
      return;
    }

    if (
      recentSheet.open &&
      recentFloorPlan?.floorPlanId &&
      (recentFloorPlan.floorPlans?.length ?? 0) > 0
    ) {
      const trackKey = `recent-${recentFloorPlan.floorPlanId}`;
      if (trackedViewSheetKeyRef.current === trackKey) return;

      trackedViewSheetKeyRef.current = trackKey;
      trackRoomTypeViewSheetView({
        floorPlanId: recentFloorPlan.floorPlanId,
        floorPlanName: recentFloorPlan.floorPlanName ?? '',
        viewCount: recentFloorPlan.floorPlans?.length ?? 0,
      });
      return;
    }

    if (!floorPlanSheet.open && !recentSheet.open) {
      trackedViewSheetKeyRef.current = null;
    }
  }, [
    floorPlanSheet.open,
    recentFloorPlan,
    recentSheet.open,
    selectedDetailViews.length,
    selectedEquilibrium,
    selectedFloorPlanId,
    selectedFloorPlanName,
  ]);

  const handleCardClickWithAnalytics = useCallback(
    (floorPlanId: number, fromRecommendation = false) => {
      const plan = floorPlans.find((item) => item.id === floorPlanId);
      if (!plan?.id) return;

      if (fromRecommendation) {
        const alternativeSpaceIds = floorPlans
          .map((item) => item.id)
          .filter((id): id is number => id !== undefined);

        trackRoomTypeEmptyListRecCardClick(plan, grid.appliedFilters, {
          spaceCount: floorPlans.length,
          alternativeSpaceIds,
        });
        handleCardClick(floorPlanId);
        return;
      }

      void (async () => {
        const detail = await fetchHouseTemplateDetail(queryClient, floorPlanId);
        trackRoomTypeCardRoomClick(plan, detail);
      })();

      handleCardClick(floorPlanId);
    },
    [floorPlans, grid.appliedFilters, handleCardClick, queryClient]
  );

  const handleConfirmFloorPlanWithAnalytics = useCallback(async () => {
    if (selectedFloorPlanId === null) return;

    const floorPlanView =
      selectedDetailViews[useFloorPlanStore.getState().selectedViewIndex]
        ?.view ?? '';

    const recentForAnalytics =
      await ensureRecentFloorPlanForAnalytics(queryClient);

    trackRoomTypeViewSheetSubmit({
      floorPlanId: selectedFloorPlanId,
      floorPlanName: selectedFloorPlanName,
      floorPlanView,
      equilibrium: selectedEquilibrium,
      recentFloorPlan: recentForAnalytics,
    });
    handleConfirmFloorPlan();
  }, [
    handleConfirmFloorPlan,
    queryClient,
    selectedDetailViews,
    selectedEquilibrium,
    selectedFloorPlanId,
    selectedFloorPlanName,
  ]);

  const handleConfirmRecentFloorPlanWithAnalytics = useCallback(async () => {
    if (!recentFloorPlan?.floorPlanId) return;

    const floorPlanView =
      (recentFloorPlan.floorPlans ?? [])[
        useFloorPlanStore.getState().selectedViewIndex
      ]?.view ?? '';

    const recentForAnalytics =
      await ensureRecentFloorPlanForAnalytics(queryClient);

    trackRoomTypeViewSheetSubmit({
      floorPlanId: recentFloorPlan.floorPlanId,
      floorPlanName: recentFloorPlan.floorPlanName ?? '',
      floorPlanView,
      equilibrium: recentFloorPlan.equilibrium,
      recentFloorPlan: recentForAnalytics,
    });
    handleConfirmRecentFloorPlan();
  }, [handleConfirmRecentFloorPlan, queryClient, recentFloorPlan]);

  const handleFilterApplyWithAnalytics = useCallback(() => {
    const nextFilters = useFloorPlanStore.getState().pendingFilters;
    trackRoomTypeFilterSheetSubmit(nextFilters);
    filterSheet.onApply();
  }, [filterSheet]);

  const handleFilterResetWithAnalytics = useCallback(() => {
    filterSheet.onReset();
    trackRoomTypeFilterSheetReset();
  }, [filterSheet]);

  const handleFilterCloseWithAnalytics = useCallback(() => {
    trackRoomTypeFilterSheetCloseClick();
    filterSheet.onClose();
  }, [filterSheet]);

  const handleFilterDimmedCloseWithAnalytics = useCallback(() => {
    trackRoomTypeFilterSheetDimmedClick();
    filterSheet.onClose();
  }, [filterSheet]);

  return {
    setGridScrollRef,
    filterCategories: floorPlanSelect.filterCategories,
    floorPlans,
    isExact,
    selectedFloorPlanName,
    selectedEquilibrium,
    selectedDetailViews,
    recentFloorPlan,
    handleCardClick: handleCardClickWithAnalytics,
    handleConfirmFloorPlan: handleConfirmFloorPlanWithAnalytics,
    handleConfirmRecentFloorPlan: handleConfirmRecentFloorPlanWithAnalytics,
    grid,
    filterSheet: {
      ...filterSheet,
      onApply: handleFilterApplyWithAnalytics,
      onReset: handleFilterResetWithAnalytics,
      onClose: handleFilterCloseWithAnalytics,
      onOverlayClose: handleFilterDimmedCloseWithAnalytics,
    },
    floorPlanSheet,
    recentSheet,
  };
};
