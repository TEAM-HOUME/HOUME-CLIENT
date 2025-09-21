// ActivityInfo 도메인 관련 모든 타입 통합 관리
// 폼 데이터 타입 (사용자 입력값)
export interface ActivityInfoFormData {
  activityType?: string;
  bedId?: number;
  selectiveIds?: number[];
}

// funnel 스텝 컨텍스트 타입
export interface ActivityInfoContext {
  houseType: string;
  roomType: string;
  areaType: string;
  houseId: number;
  floorPlan: {
    floorPlanId: number;
    isMirror: boolean;
  };
  moodBoardIds: number[];
  activityType?: string;
  bedId?: number;
  selectiveIds?: number[];
}

// 완성된 ActivityInfo 데이터 타입
export type CompletedActivityInfo = Required<ActivityInfoContext>;

// 에러 타입
export interface ActivityInfoErrors {
  activityType?: string;
  bedId?: string;
  selectiveIds?: string;
}
