import type { HouseType, RoomType, AreaType, PrimaryUsage } from './options';

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
  InteriorTaste: {
    houseType: HouseType;
    roomType: RoomType;
    areaType: AreaType;
    houseId: number;
    floorPlan: FloorPlan;
    moodBoardIds?: number[];
  };
  MainActivity: {
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
export type CompletedInteriorTaste = Required<ImageSetupSteps['InteriorTaste']>;
// MainActivity(STEP4)의 '기타가구'는 필수 입력란이 아니므로 추후 수정 예정
export type CompletedMainActivity = Required<ImageSetupSteps['MainActivity']>;
