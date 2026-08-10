/**
 * 도면 선택 그리드의 비율(1:1 / 3:2) 선택 전용 스토어
 *
 * useFloorPlanStore(선택/필터/시트)와 분리한 이유 = 수명이 다르기 때문:
 * - useFloorPlanStore의 상태는 퍼널 이탈(ImageSetupPage unmount) 시 reset되는 휘발성 상태
 * - 비율은 "탭이 유지되는 동안" 보존돼야 함
 *   → 퍼널 이탈 재진입(in-memory reset)과 카카오 OAuth full-reload(window.location 이동) 모두 보존되어야 함
 *
 * zustand sessionStorage persist로 두 경우를 모두 커버 (useFunnelStore와 동일 패턴).
 * API 응답에는 aspectRatio가 없으므로 서버 상태가 아닌 클라이언트 세션 상태로 관리함
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type FloorPlanAspectRatio = '1:1' | '3:2';

interface FloorPlanRatioStore {
  aspectRatio: FloorPlanAspectRatio;
  setAspectRatio: (ratio: FloorPlanAspectRatio) => void;
}

export const useFloorPlanRatioStore = create<FloorPlanRatioStore>()(
  persist(
    (set) => ({
      aspectRatio: '1:1',
      setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
    }),
    {
      name: 'floor-plan-ratio-store',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
