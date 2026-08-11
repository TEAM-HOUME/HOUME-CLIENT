interface FloorPlan {
  floorPlanId: number;
  isMirror: boolean;
  floorPlanView: string; // ex: '창문뷰'
}

// Funnel Step 정의 (HouseInfo·FloorPlan 단계를 FloorPlanSelect로 통합한 구조)
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
  // 이전 단계 입력값 누적 + activity, furnitureIds
  ActivityInfo: {
    floorPlan: FloorPlan;
    moodBoardIds: number[];
    activity?: string;
    furnitureIds?: number[];
  };
};

export type CompletedFloorPlanSelect = Required<
  ImageSetupSteps['FloorPlanSelect']
>;
export type CompletedInteriorStyle = Required<ImageSetupSteps['InteriorStyle']>;
