import { useRef } from 'react';

import { useMutation } from '@tanstack/react-query';

import { useSavedItemsStore } from '@store/useSavedItemsStore';

import {
  trackSaveToastCancelClick,
  trackSaveToastToSeeClick,
  trackToastSaveView,
  trackToastUnsaveView,
} from '@analytics/componentAnalytics';
import type { LoginEntryRoute } from '@analytics/params/gate';
import { resolveScreenName } from '@analytics/utils/screenName/resolveScreenName';

import type { JjymToggleResponse } from '@apis/__generated__/data-contracts';
import { queryClient } from '@apis/config/queryClient';
import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';

import { useJjymToast } from '@hooks/useJjymToast';
import { useLoginGate } from '@hooks/useLoginGate';

import { invalidateJjymRelatedQueries } from '@utils/invalidateJjymQueries';

import type { AxiosError } from 'axios';

type JjymSavedToast = 'move' | 'stored' | 'none';

interface UseJjymMutationOptions {
  savedToastType?: JjymSavedToast;
  onSavedAction?: () => void;
  invalidateSavedItemsList?: boolean; // 찜 목록 무효화 여부
  loginEntryRoute?: LoginEntryRoute;
}

export const postJjym = async (
  rawProductId: number
): Promise<JjymToggleResponse> => {
  return request<JjymToggleResponse>({
    method: HTTPMethod.POST,
    url: API_ENDPOINT.GENERATE.JJYM_V2(rawProductId),
  });
};

const getCurrentScreenName = () =>
  resolveScreenName(window.location.pathname + window.location.search);

export const useJjymMutation = (options?: UseJjymMutationOptions) => {
  const toggleSaveProduct = useSavedItemsStore((s) => s.toggleSaveProduct);
  const { notifyJjymToast } = useJjymToast();
  const { requireLogin } = useLoginGate();
  const pendingJjymContextRef = useRef<
    Map<number, { productName?: string; screenName: string }>
  >(new Map());
  const savedToastType = options?.savedToastType ?? 'move';
  const shouldInvalidateSavedItemsList =
    options?.invalidateSavedItemsList !== false;

  const syncSavedStateWithServer = async (rawProductId: number) => {
    const response = await postJjym(rawProductId);
    const isSavedNow = useSavedItemsStore
      .getState()
      .savedProductIds.has(rawProductId);

    if (isSavedNow !== response.favorited) {
      toggleSaveProduct(rawProductId);
    }

    await invalidateJjymRelatedQueries(
      queryClient,
      shouldInvalidateSavedItemsList
    );
  };

  const mutation = useMutation<JjymToggleResponse, AxiosError, number>({
    mutationKey: ['jjym'],
    mutationFn: postJjym,

    onMutate: (rawProductId) => {
      toggleSaveProduct(rawProductId);
      return { rawProductId };
    },

    onSuccess: async (data, rawProductId) => {
      const pendingContext = pendingJjymContextRef.current.get(rawProductId);
      pendingJjymContextRef.current.delete(rawProductId);
      const productName = pendingContext?.productName;
      const screenName = pendingContext?.screenName ?? getCurrentScreenName();
      const isSavedNow = useSavedItemsStore
        .getState()
        .savedProductIds.has(rawProductId);

      if (isSavedNow !== data.favorited) {
        toggleSaveProduct(rawProductId);
      }

      if (data.favorited) {
        if (savedToastType === 'none') {
          await invalidateJjymRelatedQueries(
            queryClient,
            shouldInvalidateSavedItemsList
          );
          return;
        }

        const toastInput = {
          screenName,
          rawProductId,
          productName,
        };

        trackToastSaveView(toastInput);

        notifyJjymToast({
          favorited: true,
          onAction: () => {
            trackSaveToastToSeeClick(toastInput);
            options?.onSavedAction?.();
          },
        });
      } else {
        const toastInput = {
          screenName,
          rawProductId,
          productName,
        };

        trackToastUnsaveView(toastInput);

        notifyJjymToast({
          favorited: false,
          onAction: () => {
            trackSaveToastCancelClick(toastInput);
            toggleSaveProduct(rawProductId);

            void syncSavedStateWithServer(rawProductId).catch(() => {
              toggleSaveProduct(rawProductId);
            });
          },
        });
      }

      await invalidateJjymRelatedQueries(
        queryClient,
        shouldInvalidateSavedItemsList
      );
    },

    onError: (_error, rawProductId) => {
      pendingJjymContextRef.current.delete(rawProductId);
      toggleSaveProduct(rawProductId);
    },
  });

  // 찜 토글 전 로그인 게이트: 비로그인이면 mutate 미실행 → onMutate 낙관적 업데이트도 일어나지 않음
  type JjymMutateOptions = Parameters<typeof mutation.mutate>[1] & {
    loginEntryRoute?: LoginEntryRoute;
    productName?: string;
  };

  const mutate = (rawProductId: number, mutateOptions?: JjymMutateOptions) => {
    const { loginEntryRoute, productName, ...restOptions } =
      mutateOptions ?? {};

    requireLogin(() => {
      pendingJjymContextRef.current.set(rawProductId, {
        productName,
        screenName: getCurrentScreenName(),
      });
      mutation.mutate(rawProductId, restOptions);
    }, loginEntryRoute ?? options?.loginEntryRoute);
  };

  return { ...mutation, mutate };
};
