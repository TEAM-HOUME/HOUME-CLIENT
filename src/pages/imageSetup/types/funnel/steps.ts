interface FloorPlan {
  floorPlanId: number;
  isMirror: boolean;
}

// Funnel Step 정의
export type ImageSetupSteps = {
  // TODO(지성): 재사용 가능한 타입들 재사용하기
  HouseInfo: {
    houseType?: string;
    roomType?: string;
    areaType?: string;
    houseId?: number;
  };
  FloorPlan: {
    houseType: string;
    roomType: string;
    areaType: string;
    houseId: number;
    floorPlan?: FloorPlan;
  };
  InteriorStyle: {
    houseType: string;
    roomType: string;
    areaType: string;
    houseId: number;
    floorPlan: FloorPlan;
    moodBoardIds?: number[];
  };
  ActivityInfo: {
    houseType: string;
    roomType: string;
    areaType: string;
    houseId: number;
    floorPlan: FloorPlan;
    moodBoardIds: number[];
    activityType?: string;
    bedId?: number;
    selectiveIds?: number[];
  };
};

// TODO(지성): FloorPlan, InteriorStyle 리팩토링 후 제거
export type CompletedFloorPlan = Required<ImageSetupSteps['FloorPlan']>;
export type CompletedInteriorStyle = Required<ImageSetupSteps['InteriorStyle']>;
