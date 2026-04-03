interface FloorPlan {
  floorPlanId: number;
  isMirror: boolean;
}

// Funnel Step 정의 (v2: HouseInfo + FloorPlan → FloorPlanSelect)
export type ImageSetupSteps = {
  // FloorPlanSelect: 도면 선택 결과만 관리
  FloorPlanSelect: {
    floorPlan?: FloorPlan;
  };
  // 이전 단계 입력값 누적 + moodBoardIds
  InteriorStyle: {
    floorPlan: FloorPlan;
    moodBoardIds?: number[];
  };
  // 이전 단계 입력값 누적 + activityType, selectiveIds
  ActivityInfo: {
    floorPlan: FloorPlan;
    moodBoardIds: number[];
    activityType?: string;
    selectiveIds?: number[];
  };
};

export type CompletedFloorPlanSelect = Required<
  ImageSetupSteps['FloorPlanSelect']
>;
export type CompletedInteriorStyle = Required<ImageSetupSteps['InteriorStyle']>;
