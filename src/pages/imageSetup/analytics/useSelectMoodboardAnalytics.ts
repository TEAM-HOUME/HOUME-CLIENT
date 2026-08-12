import { useCallback } from 'react';

import {
  trackSelectMoodboardBtnCtaClick,
  trackSelectMoodboardBtnCtaInactiveClick,
  trackSelectMoodboardCardClick,
} from '@pages/imageSetup/analytics/selectMoodboardAnalytics';
import { useInteriorStyle } from '@pages/imageSetup/hooks/useInteriorStyle';

import { GA_EVENTS } from '@analytics/events';
import { useAnalyticsPageView } from '@analytics/hooks/useAnalyticsPageView';
import { useScrollDepthTrack } from '@analytics/hooks/useScrollDepthTrack';
import { SCREEN_NAME } from '@analytics/screenNames';
import { getEntryRoute } from '@analytics/utils/imageEntryRoute/readImageEntryRoute';
import { loginStatusParams } from '@analytics/utils/loginStatus';

import type {
  CompletedInteriorStyle,
  ImageSetupSteps,
} from '../types/funnel/steps';

export const useSelectMoodboardAnalytics = (
  context: ImageSetupSteps['InteriorStyle'],
  onNext: (data: CompletedInteriorStyle) => void
) => {
  const interiorStyle = useInteriorStyle(context, onNext);
  const { selectedImages, handleImageSelect, handleNext, isDataComplete } =
    interiorStyle;

  useAnalyticsPageView(
    GA_EVENTS.selectMoodboard.PAGE_VIEW,
    SCREEN_NAME.SELECT_MOODBOARD,
    {
      ...loginStatusParams(),
      image_entry_route: getEntryRoute(),
    }
  );

  useScrollDepthTrack(
    GA_EVENTS.selectMoodboard.PAGE_SCROLL,
    SCREEN_NAME.SELECT_MOODBOARD,
    {
      extraParams: loginStatusParams(),
    }
  );

  const handleImageSelectWithAnalytics = useCallback(
    (imageId: number) => {
      const isSelected = selectedImages.includes(imageId);

      if (!isSelected) {
        trackSelectMoodboardCardClick();
      }

      handleImageSelect(imageId);
    },
    [handleImageSelect, selectedImages]
  );

  const handleCtaButtonClick = useCallback(() => {
    if (!isDataComplete) {
      trackSelectMoodboardBtnCtaInactiveClick();
      return;
    }

    trackSelectMoodboardBtnCtaClick(selectedImages);
    handleNext();
  }, [handleNext, isDataComplete, selectedImages]);

  return {
    selectedImages,
    handleImageSelect: handleImageSelectWithAnalytics,
    handleCtaButtonClick,
    isDataComplete,
  };
};
