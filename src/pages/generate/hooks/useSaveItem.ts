import { useMutation } from '@tanstack/react-query';

import { queryClient } from '@/shared/apis/queryClient';
import { QUERY_KEY } from '@/shared/constants/queryKey';
import { useSavedItemsStore } from '@/store/useSavedItemsStore';

import { postJjym } from '../apis/saveItems';

import type { SaveItemsResponse } from '../types/saveItems';
import type { AxiosError } from 'axios';

// 가구 찜하기 훅
export const usePostJjymMutation = () => {
  const toggleSaveProduct = useSavedItemsStore((s) => s.toggleSaveProduct);

  return useMutation<SaveItemsResponse, AxiosError, number>({
    mutationFn: (recommendFurnitureId) => postJjym({ recommendFurnitureId }),

    onMutate: async (recommendFurnitureId) => {
      toggleSaveProduct(recommendFurnitureId); // UI 즉시 반영
      return { recommendFurnitureId };
    },

    onSuccess: (data, recommendFurnitureId) => {
      const isSavedNow = useSavedItemsStore
        .getState()
        .savedProductIds.has(recommendFurnitureId);

      // 서버가 돌려준 최종 상태(favorited)와 다르면 한 번 더 토글해서 맞춤
      if (isSavedNow !== data.favorited) {
        toggleSaveProduct(recommendFurnitureId);
      }

      // 찜 목록 토글 성공시 목록 최신화
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.JJYM_LIST] });

      if (import.meta.env.DEV) console.log('찜하기 성공', data);
    },

    onError: (error, recommendFurnitureId) => {
      toggleSaveProduct(recommendFurnitureId); // 롤백
      if (import.meta.env.DEV)
        console.error('찜하기 토글 변경 중 에러 발생', error);
    },
  });
};
