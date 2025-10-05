/*
가구 큐레이션 - 찜하기 
*/

import { create } from 'zustand';

interface SavedItemsState {
  savedProductIds: Set<number>;
  toggleSaveProduct: (productId: number) => void;
}

export const useSavedItemsStore = create<SavedItemsState>((set) => ({
  // 초기 상태
  savedProductIds: new Set(),

  // 상품 ID를 받아 저장 상태 토글
  toggleSaveProduct: (productId) =>
    set((state) => {
      const newSavedIds = new Set(state.savedProductIds);

      if (newSavedIds.has(productId)) {
        newSavedIds.delete(productId); // 저장 취소
      } else {
        newSavedIds.add(productId); // 저장
      }

      return { savedProductIds: newSavedIds };
    }),
}));
