import { useMutation } from '@tanstack/react-query';

import { useSavedItemsStore } from '@/store/useSavedItemsStore';

import { postJjym } from '../apis/saveItems';

import type { SaveItemsResponse } from '../types/saveItems';
import type { AxiosError } from 'axios';

// 가구 찜하기 훅
export const usePostJjymMutation = () => {
  const toggleSaveProduct = useSavedItemsStore((s) => s.toggleSaveProduct);

  return useMutation<SaveItemsResponse, AxiosError, number>({
    mutationFn: (productId) => postJjym({ recommendFurnitureId: productId }),

    onMutate: async (productId) => {
      toggleSaveProduct(productId);
      return { productId };
    },

    onSuccess: (data, productId) => {
      const isSavedNow = useSavedItemsStore
        .getState()
        .savedProductIds.has(productId);

      // 서버가 돌려준 최종 상태(favorited)와 다르면 한 번 더 토글해서 맞춤
      if (isSavedNow !== data.favorited) {
        toggleSaveProduct(productId);
      }
      console.log('찜하기 성공', data);
    },

    onError: (error, productId) => {
      toggleSaveProduct(productId); // 롤백
      console.error('찜하기 토글 변경 중 에러 발생', error);
    },
  });
};
