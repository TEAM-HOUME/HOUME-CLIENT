/*
가구 큐레이션 - 찜하기 
*/

import { create } from 'zustand';

interface SavedItemsState {
  savedProductIds: Set<number>;
  toggleSaveProduct: (recommendId: number) => void;
  setSavedProductIds: (ids: number[] | Set<number>) => void;
  hasShownFavoriteToast: boolean;
  setHasShownFavoriteToast: (flag: boolean) => void;
}

export const useSavedItemsStore = create<SavedItemsState>((set, get) => ({
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
  setSavedProductIds: (ids) => {
    const next = new Set(ids);
    const prev = get().savedProductIds; // 현재 전역 상태에 저장되어 있는 set 가져오기

    // 현재와 가져온 set 비교 (크기, 원소)
    const isEqual =
      prev.size === next.size && [...next].every((id) => prev.has(id));
    if (isEqual) return; // no-op (아무 동작 X)
    set({ savedProductIds: next }); // 내용이 달라진 경우에만 새로운 set으로 갱신
  },
  // 찜 스낵바 노출 여부 상태
  hasShownFavoriteToast: false,
  // 스낵바 표시 플래그 갱신 함수
  setHasShownFavoriteToast: (flag) => {
    set({ hasShownFavoriteToast: flag });
  },
}));
