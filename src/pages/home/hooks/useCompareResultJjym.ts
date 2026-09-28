import { useNavigate } from 'react-router-dom';

import type { CompareResultViewProduct } from '@pages/home/components/compare/utils/mapCompareResultToView';
import { getCompareJjymSavedKeys } from '@pages/home/utils/compareJjymState';

import { ROUTES } from '@routes/paths';

import { useUserStore } from '@store/useUserStore';

import type { SaveInfo } from '@shared/types/productCard';

import { LOGIN_ENTRY_ROUTE } from '@analytics/params/gate';

import { useJjymListQuery } from '@apis/queries/useJjymListQuery';

import { useCompareJjymState } from '@hooks/useCompareJjymState';
import { useJjymToast } from '@hooks/useJjymToast';
import { useLoginGate } from '@hooks/useLoginGate';

import { getCompareJjymKey, type CompareJjymTarget } from '@utils/compareJjym';

export const useCompareResultJjym = () => {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(useUserStore((state) => state.accessToken));
  const { data: savedItems = [] } = useJjymListQuery({ enabled: isLoggedIn });
  const serverSavedKeys = getCompareJjymSavedKeys(savedItems);
  const { toggle, getSavedState, isPending } = useCompareJjymState();
  const { requireLogin } = useLoginGate();
  const { notifyJjymToast, notifyJjymError } = useJjymToast();

  const executeToggle = (
    target: CompareJjymTarget,
    showResultToast: boolean
  ) => {
    toggle(target, {
      onSuccess: (favorited) => {
        if (!showResultToast) return;
        if (favorited) {
          notifyJjymToast({
            favorited: true,
            onAction: () =>
              navigate(ROUTES.MYPAGE, {
                state: { activeTab: 'savedItems' },
              }),
          });
          return;
        }

        notifyJjymToast({
          favorited: false,
          onAction: () => executeToggle(target, false),
        });
      },
      onError: notifyJjymError,
    });
  };

  const handleToggle = (item: CompareResultViewProduct) => {
    const target = item.saveTarget;
    if (!target) return;

    if (isPending(target)) return;

    requireLogin(
      () => executeToggle(target, true),
      LOGIN_ENTRY_ROUTE.PRODUCT_CARD_SAVE
    );
  };

  const getSaveInfo = (item: CompareResultViewProduct): SaveInfo => {
    const target = item.saveTarget;
    if (!target) {
      return { isSaved: false, disabled: true, onToggle: () => undefined };
    }

    return {
      isSaved: getSavedState(
        target,
        serverSavedKeys.has(getCompareJjymKey(target))
      ),
      disabled: isPending(target),
      onToggle: () => handleToggle(item),
    };
  };

  return { getSaveInfo };
};
