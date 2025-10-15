import { create } from 'zustand';

import type { CompletedHouseInfo } from '../types/funnel/houseInfo';

interface FunnelStore {
  // 각 스텝 데이터(각 스텝 별 요구되는 데이터만 저장)
  houseInfo: CompletedHouseInfo | null;
  floorPlan: {
    floorPlanId: number;
    isMirror: boolean;
  } | null;
  moodBoardIds: number[] | null;
  activityInfo: {
    // 다른 스텝은 '다음' 버튼을 눌러 스텝을 완료할 때만 저장됨
    // ActivityInfo 스텝은 마지막 단계이므로 '다음' 버튼 X -> formData 값 바뀔 때마다 실시간으로 값 변경 반영 필요
    // 따라서 undefined도 저장할 수 있도록 optional 프로퍼티로 선언
    activityType?: string;
    selectiveIds?: number[];
  } | null;

  // 각 스텝의 데이터 저장
  setHouseInfo: (data: CompletedHouseInfo) => void;
  setFloorPlan: (data: { floorPlanId: number; isMirror: boolean }) => void;
  setMoodBoardIds: (ids: number[]) => void;
  setActivityInfo: (data: {
    activityType?: string;
    selectiveIds?: number[];
  }) => void;

  // 초기화
  reset: () => void;
}

export const useFunnelStore = create<FunnelStore>((set) => ({
  // 초기 상태
  houseInfo: null,
  floorPlan: null,
  moodBoardIds: null,
  activityInfo: null,

  // 액션
  setHouseInfo: (data) => set({ houseInfo: data }),
  setFloorPlan: (data) => set({ floorPlan: data }),
  setMoodBoardIds: (ids) => set({ moodBoardIds: ids }),
  setActivityInfo: (data) => set({ activityInfo: data }),

  // 초기화
  reset: () =>
    set({
      houseInfo: null,
      floorPlan: null,
      moodBoardIds: null,
      activityInfo: null,
    }),
}));
