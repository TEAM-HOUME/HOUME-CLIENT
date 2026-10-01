import { useCallback, useEffect, useRef } from 'react';

import {
  trackMypageFeedCardGoSiteClick,
  trackMypageFeedCardOnCardClick,
  trackMypageFeedCardSaveClick,
  trackMypageFeedCardUnsaveClick,
  trackMypageFeedCardView,
  trackMypageListSavedItemView,
} from '@pages/mypage/analytics/mypageAnalytics';

import type { JjymV2ItemResponse } from '@apis/__generated__/data-contracts';

interface UseMypageSavedItemsAnalyticsOptions {
  savedItems: JjymV2ItemResponse[];
  isFetched: boolean;
}

export const useMypageSavedItemsAnalytics = ({
  savedItems,
  isFetched,
}: UseMypageSavedItemsAnalyticsOptions) => {
  const trackedListViewRef = useRef(false);
  const trackedFeedCardViewRef = useRef(false);

  useEffect(() => {
    if (!isFetched || savedItems.length === 0 || trackedListViewRef.current) {
      return;
    }

    trackedListViewRef.current = true;
    trackMypageListSavedItemView(savedItems);
  }, [isFetched, savedItems]);

  useEffect(() => {
    if (
      !isFetched ||
      savedItems.length === 0 ||
      trackedFeedCardViewRef.current
    ) {
      return;
    }

    trackedFeedCardViewRef.current = true;
    trackMypageFeedCardView(savedItems);
  }, [isFetched, savedItems]);

  const handleFeedCardClick = useCallback((item: JjymV2ItemResponse) => {
    trackMypageFeedCardOnCardClick(item);
  }, []);

  const handleFeedCardGoSiteClick = useCallback((item: JjymV2ItemResponse) => {
    trackMypageFeedCardGoSiteClick(item);
  }, []);

  const handleFeedCardSaveToggle = useCallback(
    (item: JjymV2ItemResponse, isSaved: boolean) => {
      if (isSaved) {
        trackMypageFeedCardUnsaveClick(item);
      } else {
        trackMypageFeedCardSaveClick(item);
      }
    },
    []
  );

  return {
    handleFeedCardClick,
    handleFeedCardGoSiteClick,
    handleFeedCardSaveToggle,
  };
};
