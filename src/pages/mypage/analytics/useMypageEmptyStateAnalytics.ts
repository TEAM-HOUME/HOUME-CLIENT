import { useCallback, useEffect, useRef } from 'react';

import {
  trackMypageBtnCtaEmptyGenImgClick,
  trackMypageBtnCtaEmptySavedItemClick,
  trackMypageBtnTextEmptyGenImgClick,
  trackMypageBtnTextEmptySavedItemClick,
  trackMypageListEmptyGenImgView,
  trackMypageListEmptySavedItemView,
} from '@pages/mypage/analytics/mypageAnalytics';

import type { JjymV2ItemResponse } from '@apis/__generated__/data-contracts';

interface UseMypageEmptyStateAnalyticsOptions {
  type: 'generatedImages' | 'savedItems';
  savedItemsForParams: Pick<
    JjymV2ItemResponse,
    'rawProductId' | 'catalogItemId'
  >[];
  enabled: boolean;
}

export const useMypageEmptyStateAnalytics = ({
  type,
  savedItemsForParams,
  enabled,
}: UseMypageEmptyStateAnalyticsOptions) => {
  const trackedViewRef = useRef(false);

  useEffect(() => {
    trackedViewRef.current = false;
  }, [type]);

  useEffect(() => {
    if (!enabled || trackedViewRef.current) return;

    trackedViewRef.current = true;
    if (type === 'generatedImages') {
      trackMypageListEmptyGenImgView();
    } else {
      trackMypageListEmptySavedItemView(savedItemsForParams);
    }
  }, [enabled, savedItemsForParams, type]);

  const wrapPrimaryClick = useCallback(
    (onClick: () => void) => () => {
      if (type === 'generatedImages') {
        trackMypageBtnCtaEmptyGenImgClick();
      } else {
        trackMypageBtnCtaEmptySavedItemClick();
      }
      onClick();
    },
    [type]
  );

  const wrapSecondaryClick = useCallback(
    (onClick: () => void) => () => {
      if (type === 'generatedImages') {
        trackMypageBtnTextEmptyGenImgClick();
      } else {
        trackMypageBtnTextEmptySavedItemClick();
      }
      onClick();
    },
    [type]
  );

  return {
    wrapPrimaryClick,
    wrapSecondaryClick,
  };
};
