// ActivityInfo 도메인 관련 모든 타입 통합 관리
import type { AreaType, HouseType, RoomType } from './houseInfo';
import type { ActivityOptionsResponse } from '../apis/activityInfo';

// API 기반 Union 타입 추출
export type ActivityType =
  ActivityOptionsResponse['activities'][number]['code'];
// export type BedId = ActivityOptionsResponse['beds']['items'][number]['id'];
// export type SelectiveIds =
//   ActivityOptionsResponse['selectives']['items'][number]['id'];

// 폼 데이터 타입 (사용자 입력값)
export interface ActivityInfoFormData {
  activityType?: ActivityType;
  bedId?: number;
  selectiveIds?: number[];
}

// funnel 스텝 컨텍스트 타입
export interface ActivityInfoContext {
  houseType: HouseType;
  roomType: RoomType;
  areaType: AreaType;
  houseId: number;
  floorPlan: {
    floorPlanId: number;
    isMirror: boolean;
  };
  moodBoardIds: number[];
  activityType?: ActivityType;
  bedId?: number;
  selectiveIds?: number[];
}

// 완성된 ActivityInfo 데이터 타입
export interface CompletedActivityInfo {
  houseType: HouseType;
  roomType: RoomType;
  areaType: AreaType;
  houseId: number;
  floorPlan: {
    floorPlanId: number;
    isMirror: boolean;
  };
  moodBoardIds: number[];
  activityType: ActivityType;
  bedId: number;
  selectiveIds: number[];
}

// 에러 타입
export interface ActivityInfoErrors {
  activityType?: string;
  bedId?: string;
  selectiveIds?: string;
}
