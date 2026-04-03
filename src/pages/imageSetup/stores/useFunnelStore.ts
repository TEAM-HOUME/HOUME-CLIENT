import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// TODO: steps.ts(ImageSetupSteps)와 FunnelStore가 동일한 데이터 타입을 중복 정의 중.
// 타입 정의를 한 곳에서 관리하고 참조하도록 통합 고려 (API 명세와 타입이 확정된 이후 검토해보기)
interface FunnelStore {
  // 각 스텝 데이터(각 스텝 별 요구되는 데이터만 저장)
  floorPlan: {
    floorPlanId: number;
    isMirror: boolean;
  } | null;
  moodBoardIds: number[] | null;
  activityInfo: {
    // ActivityInfo 스텝은 마지막 단계이므로 '다음' 버튼 X -> formData 값 바뀔 때마다 실시간으로 값 변경 반영 필요
    // 따라서 undefined도 저장할 수 있도록 optional 프로퍼티로 선언
    activityType?: string;
    selectiveIds?: number[];
  } | null;

  // 각 스텝의 데이터 저장
  setFloorPlan: (data: { floorPlanId: number; isMirror: boolean }) => void;
  setMoodBoardIds: (ids: number[]) => void;
  setActivityInfo: (data: {
    activityType?: string;
    selectiveIds?: number[];
  }) => void;

  // 초기화
  reset: () => void;
}

// persist(sessionStorage) 적용 — OAuth redirect 후 퍼널 데이터 복원용
export const useFunnelStore = create<FunnelStore>()(
  persist(
    (set) => ({
      // 초기 상태
      floorPlan: null,
      moodBoardIds: null,
      activityInfo: null,

      // 액션
      setFloorPlan: (data) => set({ floorPlan: data }),
      setMoodBoardIds: (ids) => set({ moodBoardIds: ids }),
      setActivityInfo: (data) => set({ activityInfo: data }),

      // 초기화
      reset: () =>
        set({
          floorPlan: null,
          moodBoardIds: null,
          activityInfo: null,
        }),
    }),
    {
      name: 'funnel-store',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
