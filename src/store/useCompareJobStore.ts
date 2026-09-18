import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface CompareJobStore {
  /**
   * 지금 진행 중인 가격 비교 job. 없으면 null.
   * "값이 있다 = 진행 중"으로 본다 — DONE·FAILED가 오면 CompareJobWatcher(routes/)가 비운다.
   * 새 비교를 시작하면 덮어쓴다(이전 job은 서버에서 끝까지 돌지만 더 지켜보지 않는다).
   */
  activeJobId: string | null;
  setActiveJobId: (jobId: string) => void;
  clearActiveJob: () => void;
}

/**
 * 비교 job은 같은 탭 안에서만 유지한다(sessionStorage) — 다른 페이지로 갔다가 새로고침해도 완료 토스트를 받을 수 있게.
 * store/는 pages/를 import할 수 없어 비교 타입에 의존하지 않는 원시값(jobId)만 둔다.
 */
export const useCompareJobStore = create<CompareJobStore>()(
  persist(
    (set) => ({
      activeJobId: null,
      setActiveJobId: (jobId) => set({ activeJobId: jobId }),
      clearActiveJob: () => set({ activeJobId: null }),
    }),
    {
      name: 'compare-job',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
