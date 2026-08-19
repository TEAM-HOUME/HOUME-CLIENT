import { useRoomTypeAnalytics } from '@pages/imageSetup/analytics/useRoomTypeAnalytics';
import type {
  CompletedFloorPlanSelect,
  ImageSetupSteps,
} from '@pages/imageSetup/types/funnel/steps';

import FilterSheet from './FilterSheet';
import FloorPlanSelectGrid from './FloorPlanSelectGrid';
import FloorPlanSheet from './FloorPlanSheet';

interface FloorPlanSelectStepProps {
  context: ImageSetupSteps['FloorPlanSelect'];
  onNext: (data: CompletedFloorPlanSelect) => void;
}

const FloorPlanSelectStep = ({ context, onNext }: FloorPlanSelectStepProps) => {
  const {
    filterCategories,
    floorPlans,
    isExact,
    selectedFloorPlanName,
    selectedEquilibrium,
    selectedDetailViews,
    recentFloorPlan,
    handleCardClick,
    handleConfirmFloorPlan,
    handleConfirmRecentFloorPlan,
    grid,
    filterSheet,
    floorPlanSheet,
    recentSheet,
    setGridScrollRef,
  } = useRoomTypeAnalytics(context, onNext);

  return (
    <>
      <FloorPlanSelectGrid
        gridScrollRef={setGridScrollRef}
        filterCategories={filterCategories}
        floorPlans={floorPlans}
        isExact={isExact}
        appliedFilters={grid.appliedFilters}
        aspectRatio={grid.aspectRatio}
        onCardClick={handleCardClick}
        onFilterChipClick={grid.onFilterChipClick}
        onFilterChipClear={grid.onFilterChipClear}
        onAspectRatioChange={grid.onAspectRatioChange}
      />

      <FilterSheet
        open={filterSheet.open}
        onClose={filterSheet.onClose}
        filterCategories={filterCategories}
        pendingFilters={filterSheet.pendingFilters}
        onFilterChange={filterSheet.onFilterChange}
        onApply={filterSheet.onApply}
        onReset={filterSheet.onReset}
        onOverlayClose={filterSheet.onOverlayClose}
      />

      {/* TODO: overlay-kit에 상태관리 위임, use-funnel에 등록 */}
      <FloorPlanSheet
        open={floorPlanSheet.open}
        onClose={floorPlanSheet.onClose}
        floorPlanName={selectedFloorPlanName}
        equilibrium={selectedEquilibrium}
        detailViews={selectedDetailViews}
        onConfirm={handleConfirmFloorPlan}
      />

      {recentFloorPlan && (
        <FloorPlanSheet
          open={recentSheet.open}
          onClose={recentSheet.onClose}
          floorPlanName={recentFloorPlan.floorPlanName ?? ''}
          equilibrium={recentFloorPlan.equilibrium ?? ''}
          detailViews={recentFloorPlan.floorPlans ?? []}
          onConfirm={handleConfirmRecentFloorPlan}
        />
      )}
    </>
  );
};

export default FloorPlanSelectStep;
