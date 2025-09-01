import type { PrimaryUsage } from './options';
import type { HouseType, RoomType, AreaType } from './houseInfo';

interface FloorPlan {
  floorPlanId: number;
  isMirror: boolean;
}

// Funnel Step 정의
export type ImageSetupSteps = {
  HouseInfo: {
    houseType?: HouseType;
    roomType?: RoomType;
    areaType?: AreaType;
    houseId?: number;
  };
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
    primaryUsage?: PrimaryUsage;
    bedTypeId?: number;
    otherFurnitureIds?: number[];
  };
};

export type CompletedHouseInfo = Required<ImageSetupSteps['HouseInfo']>;
export type CompletedFloorPlan = Required<ImageSetupSteps['FloorPlan']>;
export type CompletedInteriorStyle = Required<ImageSetupSteps['InteriorStyle']>;
export type CompletedActivityInfo = Required<ImageSetupSteps['ActivityInfo']>;
