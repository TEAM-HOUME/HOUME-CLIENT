import type { ActivityType } from './activityInfo';
import type {
  HouseType,
  RoomType,
  AreaType,
  HouseInfoContext,
} from './houseInfo';

interface FloorPlan {
  floorPlanId: number;
  isMirror: boolean;
}

// Funnel Step 정의
export type ImageSetupSteps = {
  // TODO(지성): 재사용 가능한 타입들 재사용하기
  HouseInfo: HouseInfoContext;
  FloorPlan: {
    houseType: HouseType;
    roomType: RoomType;
    areaType: AreaType;
    houseId: number;
    floorPlan?: FloorPlan;
  };
  InteriorStyle: {
    houseType: HouseType;
    roomType: RoomType;
    areaType: AreaType;
    houseId: number;
    floorPlan: FloorPlan;
    moodBoardIds?: number[];
  };
  ActivityInfo: {
    houseType: HouseType;
    roomType: RoomType;
    areaType: AreaType;
    houseId: number;
    floorPlan: FloorPlan;
    moodBoardIds: number[];
    activityTypes?: ActivityType;
    bedId?: number;
    selectiveIds?: number[];
  };
};

// TODO(지성): FloorPlan, InteriorStyle 리팩토링 후 제거
export type CompletedFloorPlan = Required<ImageSetupSteps['FloorPlan']>;
export type CompletedInteriorStyle = Required<ImageSetupSteps['InteriorStyle']>;
