import { useState } from 'react';

import { queryClient } from '@apis/config/queryClient';
import { useCompareJjymMutation } from '@apis/mutations/useCompareJjymMutation';

import { queryKeys } from '@constants/queryKey';

import { getCompareJjymKey, type CompareJjymTarget } from '@utils/compareJjym';

interface ToggleCompareJjymOptions {
  onSuccess?: (favorited: boolean) => void;
  onError?: () => void;
}

export const useCompareJjymState = () => {
  const [savedStates, setSavedStates] = useState<Map<string, boolean>>(
    () => new Map()
  );
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(() => new Set());
  const { mutate } = useCompareJjymMutation();

  const toggle = (
    target: CompareJjymTarget,
    options?: ToggleCompareJjymOptions
  ) => {
    const key = getCompareJjymKey(target);
    if (pendingKeys.has(key)) return;

    setPendingKeys((previous) => new Set(previous).add(key));
    mutate(target, {
      onSuccess: (favorited) => {
        setSavedStates((previous) => {
          const next = new Map(previous);
          next.set(key, favorited);
          return next;
        });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.mypage.jjymList(),
        });
        options?.onSuccess?.(favorited);
      },
      onError: options?.onError,
      onSettled: () => {
        setPendingKeys((previous) => {
          const next = new Set(previous);
          next.delete(key);
          return next;
        });
      },
    });
  };

  const getSavedState = (target: CompareJjymTarget, fallback: boolean) =>
    savedStates.get(getCompareJjymKey(target)) ?? fallback;

  const isPending = (target: CompareJjymTarget) =>
    pendingKeys.has(getCompareJjymKey(target));

  return { toggle, getSavedState, isPending };
};
