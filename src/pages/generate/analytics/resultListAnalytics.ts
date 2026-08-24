import { GA_EVENTS } from '@analytics/events';
import {
  getProductCardIdNameParams,
  getProductCardIdNamePriceParams,
} from '@analytics/params/builders/productCard';
import type { ProductCardInput } from '@analytics/params/builders/productCard';
import { SCREEN_NAME } from '@analytics/screenNames';
import { trackEvent } from '@analytics/track';
import { getReturnScreenNameParams } from '@analytics/utils/screenName/buildReturnScreenParams';

const resultListScreenParams = () => ({
  screen_name: SCREEN_NAME.RESULT_LIST,
});

export const trackResultListBtnBackClick = () => {
  trackEvent(GA_EVENTS.resultList.BTN_BACK_CLICK, {
    ...resultListScreenParams(),
    ...getReturnScreenNameParams(SCREEN_NAME.HOME),
  });
};

export const trackResultListListCardClick = (product: ProductCardInput) => {
  trackEvent(GA_EVENTS.resultList.LIST_CARD_CLICK, {
    ...resultListScreenParams(),
    ...getProductCardIdNameParams(product),
  });
};

export const trackResultListListCardGoSiteClick = (
  product: ProductCardInput
) => {
  trackEvent(GA_EVENTS.resultList.LIST_CARD_GO_SITE_CLICK, {
    ...resultListScreenParams(),
    ...getProductCardIdNameParams(product),
  });
};

export const trackResultListListCardSaveClick = (product: ProductCardInput) => {
  trackEvent(GA_EVENTS.resultList.LIST_CARD_SAVE_CLICK, {
    ...resultListScreenParams(),
    ...getProductCardIdNameParams(product),
  });
};

export const trackResultListListCardUnsaveClick = (
  product: ProductCardInput
) => {
  trackEvent(GA_EVENTS.resultList.LIST_CARD_UNSAVE_CLICK, {
    ...resultListScreenParams(),
    ...getProductCardIdNameParams(product),
  });
};

export const trackResultListListSelectedView = (
  selectedProductIds?: string
) => {
  trackEvent(GA_EVENTS.resultList.LIST_SELECTED_VIEW, {
    ...resultListScreenParams(),
    selected_product_ids: selectedProductIds,
  });
};

export const trackResultListFeedCardOnCardClick = (
  product: ProductCardInput
) => {
  trackEvent(GA_EVENTS.resultList.FEED_CARDON_CARD_CLICK, {
    ...resultListScreenParams(),
    ...getProductCardIdNamePriceParams(product),
  });
};

export const trackResultListFeedCardGoSiteClick = (
  product: ProductCardInput
) => {
  trackEvent(GA_EVENTS.resultList.FEED_CARD_GO_SITE_CLICK, {
    ...resultListScreenParams(),
    ...getProductCardIdNameParams(product),
  });
};

export const trackResultListFeedCardSaveClick = (product: ProductCardInput) => {
  trackEvent(GA_EVENTS.resultList.FEED_CARD_SAVE_CLICK, {
    ...resultListScreenParams(),
    ...getProductCardIdNameParams(product),
  });
};

export const trackResultListFeedCardUnsaveClick = (
  product: ProductCardInput
) => {
  trackEvent(GA_EVENTS.resultList.FEED_CARD_UNSAVE_CLICK, {
    ...resultListScreenParams(),
    ...getProductCardIdNameParams(product),
  });
};

export const trackResultListBtnReselectClick = (
  selectedProductIds?: string
) => {
  trackEvent(GA_EVENTS.resultList.BTN_RESELECT_CLICK, {
    ...resultListScreenParams(),
    selected_product_ids: selectedProductIds,
    ...getReturnScreenNameParams(SCREEN_NAME.HOME),
  });
};

export const trackResultListListLookAroundView = (
  lookAroundProductIds?: string
) => {
  trackEvent(GA_EVENTS.resultList.LIST_LOOK_AROUND_VIEW, {
    ...resultListScreenParams(),
    look_around_product_ids: lookAroundProductIds,
  });
};

export const trackResultListImgCardOnCardClick = ({
  genImgId,
  selectedProductIds,
  othersImgId,
}: {
  genImgId: number;
  selectedProductIds?: string;
  othersImgId: number;
}) => {
  trackEvent(GA_EVENTS.resultList.IMG_CARDON_CARD_CLICK, {
    ...resultListScreenParams(),
    gen_img_id: genImgId,
    selected_product_ids: selectedProductIds,
    others_img_id: othersImgId,
    ...getReturnScreenNameParams(SCREEN_NAME.HOME),
  });
};

export const trackResultListListOthersImgView = (othersImgIds?: string) => {
  trackEvent(GA_EVENTS.resultList.LIST_OTHERS_IMG_VIEW, {
    ...resultListScreenParams(),
    others_img_ids: othersImgIds,
  });
};
