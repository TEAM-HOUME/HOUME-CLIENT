import { useState } from 'react';

import type { CompareResultViewProduct } from '@pages/home/components/compare/utils/mapCompareResultToView';

import type { SaveInfo } from '@shared/types/productCard';
import { TOAST_TYPE } from '@shared/types/toast';

import { LOGIN_ENTRY_ROUTE } from '@analytics/params/gate';

import { useCompareJjymMutation } from '@apis/mutations/useCompareJjymMutation';

import { useToast } from '@components/toast/useToast';

import { TOAST_MESSAGE } from '@constants/toastMessage';

import { useLoginGate } from '@hooks/useLoginGate';

import type { CompareJjymTarget } from '@utils/compareJjym';

const getSaveKey = ({ productId, source }: CompareJjymTarget) =>
  `${source}:${productId}`;

export const useCompareResultJjym = () => {
  const [savedKeys, setSavedKeys] = useState<Set<string>>(() => new Set());
  const [pendingSaveKeys, setPendingSaveKeys] = useState<Set<string>>(
    () => new Set()
  );
  const { mutate: toggleCompareJjym } = useCompareJjymMutation();
  const { requireLogin } = useLoginGate();
  const { notify } = useToast();

  const handleToggle = (item: CompareResultViewProduct) => {
    const target = item.saveTarget;
    if (!target) return;

    const key = getSaveKey(target);
    if (pendingSaveKeys.has(key)) return;

    requireLogin(() => {
      setPendingSaveKeys((previous) => new Set(previous).add(key));
      toggleCompareJjym(target, {
        onSuccess: (favorited) => {
          setSavedKeys((previous) => {
            const next = new Set(previous);
            if (favorited) next.add(key);
            else next.delete(key);
            return next;
          });
          notify({
            text: favorited
              ? TOAST_MESSAGE.SAVED_ITEM_STORED
              : TOAST_MESSAGE.SAVED_ITEM_REMOVED,
            type: TOAST_TYPE.SUCCESS,
          });
        },
        onError: () => {
          notify({
            text: TOAST_MESSAGE.ACTION_SERVER_ERROR,
            type: TOAST_TYPE.ERROR,
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
    }, LOGIN_ENTRY_ROUTE.PRODUCT_CARD_SAVE);
  };

  const getSaveInfo = (item: CompareResultViewProduct): SaveInfo => {
    const target = item.saveTarget;
    if (!target) {
      return { isSaved: false, disabled: true, onToggle: () => undefined };
    }

    const key = getSaveKey(target);
    return {
      isSaved: savedKeys.has(key),
      disabled: pendingSaveKeys.has(key),
      onToggle: () => handleToggle(item),
    };
  };

  return { getSaveInfo };
};
