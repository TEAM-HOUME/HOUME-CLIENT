// ActivityInfo 도메인 관련 모든 타입 통합 관리

// 폼 데이터 타입 (사용자 입력값)
export type ActivityInfoFormData = {
  activityType?: string;
  selectiveIds?: number[];
};

// funnel 스텝 컨텍스트 타입
export type ActivityInfoContext = {
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
  selectiveIds?: number[];
};

// 완성된 ActivityInfo 데이터 타입
export type CompletedActivityInfo = Required<ActivityInfoContext>;

// 에러 타입
export type ActivityInfoErrors = {
  activityType?: string;
  selectiveIds?: string;
};

// 카테고리별 선택 설정
export type CategorySelectionMode = 'single' | 'multiple';

export const CATEGORY_SELECTION_CONFIG = {
  BED: 'single' as CategorySelectionMode, // 침대
  SOFA: 'single' as CategorySelectionMode, // 소파
  STORAGE: 'multiple' as CategorySelectionMode, // 수납
  TABLE: 'multiple' as CategorySelectionMode, // 테이블
  ETC: 'multiple' as CategorySelectionMode, // 그외
} as const;
