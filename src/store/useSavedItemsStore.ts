/*
가구 큐레이션 - 찜하기 
*/

import { create } from 'zustand';

interface SavedItemsState {
  savedProductIds: Set<number>;
  toggleSaveProduct: (recommendId: number) => void;
  setSavedProductIds: (ids: number[] | Set<number>) => void;
}

export const useSavedItemsStore = create<SavedItemsState>((set) => ({
  // 초기 상태 (recommendId Set)
  savedProductIds: new Set(),

  // 추천ID(recommendId) 기준으로 저장 상태 토글
  toggleSaveProduct: (recommendId) =>
    set((state) => {
      const newSavedIds = new Set(state.savedProductIds);

      if (newSavedIds.has(recommendId)) {
        newSavedIds.delete(recommendId); // 저장 취소
      } else {
        newSavedIds.add(recommendId); // 저장
      }

      return { savedProductIds: newSavedIds };
    }),

  // 서버 찜 목록으로 전역 상태 초기화(새로고침 시 하트 복구)
  setSavedProductIds: (ids) => set(() => ({ savedProductIds: new Set(ids) })),
}));
