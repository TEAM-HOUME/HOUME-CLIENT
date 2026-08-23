import { GA_EVENTS } from '@analytics/events';
import { SCREEN_NAME } from '@analytics/screenNames';
import { trackEvent } from '@analytics/track';
import { getEntryRoute } from '@analytics/utils/imageEntryRoute/readImageEntryRoute';
import { toLoadPreferenceType } from '@analytics/utils/imageFlow/formatFunnelGaParams';
import { getLoadImgReturnScreenName } from '@analytics/utils/imageFlow/resolveFunnelReturnScreen';

const loadImgScreenParams = () => ({
  screen_name: SCREEN_NAME.LOAD_IMG,
});

const loadImgReturnScreenParams = () => ({
  return_screen_name: getLoadImgReturnScreenName(),
});

export const trackLoadImgPageRefresh = () => {
  trackEvent(GA_EVENTS.loadImg.PAGE_REFRESH, {
    ...loadImgScreenParams(),
    ...loadImgReturnScreenParams(),
  });
};

export const trackLoadImgPageBackSwipe = () => {
  trackEvent(GA_EVENTS.loadImg.PAGE_BACK_SWIPE, {
    ...loadImgScreenParams(),
    ...loadImgReturnScreenParams(),
  });
};

export const trackLoadImgCardPreferenceView = ({
  productId,
  loadedProductIds,
}: {
  productId: number;
  loadedProductIds: string;
}) => {
  trackEvent(GA_EVENTS.loadImg.CARD_PREFERENCE_VIEW, {
    ...loadImgScreenParams(),
    product_id: productId,
    loaded_product_ids: loadedProductIds,
  });
};

export const trackLoadImgMdGenImgQuitView = () => {
  trackEvent(GA_EVENTS.loadImg.MD_GEN_IMG_QUIT_VIEW);
};

export const trackLoadImgCardPreferenceClick = ({
  productId,
  isLike,
}: {
  productId: number;
  isLike: boolean;
}) => {
  trackEvent(GA_EVENTS.loadImg.CARD_PREFERENCE_CLICK, {
    ...loadImgScreenParams(),
    image_entry_route: getEntryRoute(),
    product_id: productId,
    load_preference_type: toLoadPreferenceType(isLike),
  });
};
