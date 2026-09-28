import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import type { CompareResultViewProduct } from '@pages/home/components/compare/utils/mapCompareResultToView';
import { getCompareJjymSavedKeys } from '@pages/home/utils/compareJjymState';

import { ROUTES } from '@routes/paths';

import { useUserStore } from '@store/useUserStore';

import type { SaveInfo } from '@shared/types/productCard';
import { TOASTER_ID, TOAST_TYPE } from '@shared/types/toast';

import { LOGIN_ENTRY_ROUTE } from '@analytics/params/gate';

import { queryClient } from '@apis/config/queryClient';
import { useCompareJjymMutation } from '@apis/mutations/useCompareJjymMutation';
import { useJjymListQuery } from '@apis/queries/useJjymListQuery';

import { useToast } from '@components/toast/useToast';

import { queryKeys } from '@constants/queryKey';
import { TOAST_ACTION_LABEL, TOAST_MESSAGE } from '@constants/toastMessage';

import { useLoginGate } from '@hooks/useLoginGate';

import type { CompareJjymTarget } from '@utils/compareJjym';

const getSaveKey = ({ productId, source }: CompareJjymTarget) =>
  `${source}:${productId}`;

export const useCompareResultJjym = () => {
  const navigate = useNavigate();
  const [savedStates, setSavedStates] = useState<Map<string, boolean>>(
    () => new Map()
  );
  const [pendingSaveKeys, setPendingSaveKeys] = useState<Set<string>>(
    () => new Set()
  );
  const isLoggedIn = Boolean(useUserStore((state) => state.accessToken));
  const { data: savedItems = [] } = useJjymListQuery({ enabled: isLoggedIn });
  const serverSavedKeys = getCompareJjymSavedKeys(savedItems);
  const { mutate: toggleCompareJjym } = useCompareJjymMutation();
  const { requireLogin } = useLoginGate();
  const { notify } = useToast();

  const updateSavedState = (key: string, favorited: boolean) => {
    setSavedStates((previous) => {
      const next = new Map(previous);
      next.set(key, favorited);
      return next;
    });
  };

  const invalidateSavedItems = () => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.mypage.jjymList(),
    });
  };

  const executeToggle = (
    target: CompareJjymTarget,
    key: string,
    showResultToast: boolean
  ) => {
    setPendingSaveKeys((previous) => new Set(previous).add(key));
    toggleCompareJjym(target, {
      onSuccess: (favorited) => {
        updateSavedState(key, favorited);
        invalidateSavedItems();

        if (!showResultToast) return;
        if (favorited) {
          notify({
            text: TOAST_MESSAGE.SAVED_ITEM_STORED,
            type: TOAST_TYPE.ACTION,
            actionLabel: TOAST_ACTION_LABEL.VIEW,
            onClick: () =>
              navigate(ROUTES.MYPAGE, {
                state: { activeTab: 'savedItems' },
              }),
            options: { toasterId: TOASTER_ID.BOTTOM_4 },
          });
          return;
        }

        notify({
          text: TOAST_MESSAGE.SAVED_ITEM_REMOVED,
          type: TOAST_TYPE.ACTION,
          actionLabel: TOAST_ACTION_LABEL.UNDO,
          onClick: () => executeToggle(target, key, false),
          options: { toasterId: TOASTER_ID.BOTTOM_4 },
        });
      },
      onError: () => {
        notify({
          text: TOAST_MESSAGE.ACTION_SERVER_ERROR,
          type: TOAST_TYPE.ERROR,
          options: { toasterId: TOASTER_ID.BOTTOM_4 },
        });
      },
      onSettled: () => {
        setPendingSaveKeys((previous) => {
          const next = new Set(previous);
          next.delete(key);
          return next;
        });
      },
    });
  };

  const handleToggle = (item: CompareResultViewProduct) => {
    const target = item.saveTarget;
    if (!target) return;

    const key = getSaveKey(target);
    if (pendingSaveKeys.has(key)) return;

    requireLogin(
      () => executeToggle(target, key, true),
      LOGIN_ENTRY_ROUTE.PRODUCT_CARD_SAVE
    );
  };

  const getSaveInfo = (item: CompareResultViewProduct): SaveInfo => {
    const target = item.saveTarget;
    if (!target) {
      return { isSaved: false, disabled: true, onToggle: () => undefined };
    }

    const key = getSaveKey(target);
    return {
      isSaved: savedStates.get(key) ?? serverSavedKeys.has(key),
      disabled: pendingSaveKeys.has(key),
      onToggle: () => handleToggle(item),
    };
  };

  return { getSaveInfo };
};
