import type {
  ActivityTypes,
  BedIds,
  SelectiveFurnitureIds,
} from './activityInfo';
import type {
  HouseType,
  RoomType,
  AreaType,
  HouseInfoContext,
  CompletedHouseInfo,
} from './houseInfo';

interface FloorPlan {
  floorPlanId: number;
  isMirror: boolean;
}

// Funnel Step 정의
export type ImageSetupSteps = {
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
    activityTypes?: ActivityTypes;
    bedTypeId?: number;
    selectiveFurnitureIds?: number[];
  };
};

// CompletedHouseInfo는 houseInfo.ts에서 import
export type CompletedFloorPlan = Required<ImageSetupSteps['FloorPlan']>;
export type CompletedInteriorStyle = Required<ImageSetupSteps['InteriorStyle']>;
export type CompletedActivityInfo = Required<ImageSetupSteps['ActivityInfo']>;

// re-export for convenience (통합 파일에서 가져온 타입을 다시 export)
export type { CompletedHouseInfo } from './houseInfo';
