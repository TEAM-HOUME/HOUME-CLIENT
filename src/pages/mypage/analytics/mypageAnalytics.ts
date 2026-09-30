import {
  getMypageGenImgItemParams,
  getMypageGenImgListParams,
  getMypageEmptyGenImgListParams,
  getMypageSavedItemsListParams,
  mypageReturnScreenParams,
  mypageScreenParams,
} from '@pages/mypage/analytics/mypageAnalyticsParams';

import { GA_EVENTS } from '@analytics/events';
import {
  getProductCardIdNameParams,
  getProductCardIdNamePriceParams,
  joinAnalyticsIds,
  toProductCardInputFromJjymFeed,
  toProductCardInputFromUsedListProduct,
} from '@analytics/params/builders/productCard';
import { trackEvent } from '@analytics/track';

import type {
  DateGroupResponse,
  ItemResponse,
  JjymV2ItemResponse,
  UsedProductResponse,
} from '@apis/__generated__/data-contracts';

export const trackMypageFeedCardView = (
  items: Pick<JjymV2ItemResponse, 'rawProductId' | 'catalogItemId'>[] = []
) => {
  trackEvent(GA_EVENTS.mypage.FEED_CARD_VIEW, {
    ...mypageScreenParams(),
    ...getMypageSavedItemsListParams(items),
  });
};

export const trackMypageFeedCardGoSiteClick = (item: JjymV2ItemResponse) => {
  trackEvent(GA_EVENTS.mypage.FEED_CARD_GO_SITE_CLICK, {
    ...mypageScreenParams(),
    ...getProductCardIdNameParams(toProductCardInputFromJjymFeed(item)),
  });
};

export const trackMypageFeedCardSaveClick = (item: JjymV2ItemResponse) => {
  trackEvent(GA_EVENTS.mypage.FEED_CARD_SAVE_CLICK, {
    ...mypageScreenParams(),
    ...getProductCardIdNameParams(toProductCardInputFromJjymFeed(item)),
  });
};

export const trackMypageFeedCardUnsaveClick = (item: JjymV2ItemResponse) => {
  trackEvent(GA_EVENTS.mypage.FEED_CARD_UNSAVE_CLICK, {
    ...mypageScreenParams(),
    ...getProductCardIdNameParams(toProductCardInputFromJjymFeed(item)),
  });
};

export const trackMypageFeedCardOnCardClick = (item: JjymV2ItemResponse) => {
  trackEvent(GA_EVENTS.mypage.FEED_CARDON_CARD_CLICK, {
    ...mypageScreenParams(),
    ...getProductCardIdNamePriceParams(toProductCardInputFromJjymFeed(item)),
  });
};

export const trackMypageListCardClick = (item: UsedProductResponse) => {
  trackEvent(GA_EVENTS.mypage.LIST_CARD_CLICK, {
    ...mypageScreenParams(),
    ...getProductCardIdNamePriceParams(
      toProductCardInputFromUsedListProduct(item)
    ),
  });
};

export const trackMypageListCardGoSiteClick = (item: UsedProductResponse) => {
  trackEvent(GA_EVENTS.mypage.LIST_CARD_GO_SITE_CLICK, {
    ...mypageScreenParams(),
    ...getProductCardIdNamePriceParams(
      toProductCardInputFromUsedListProduct(item)
    ),
  });
};

export const trackMypageListCardSaveClick = (item: UsedProductResponse) => {
  trackEvent(GA_EVENTS.mypage.LIST_CARD_SAVE_CLICK, {
    ...mypageScreenParams(),
    ...getProductCardIdNameParams(toProductCardInputFromUsedListProduct(item)),
  });
};

export const trackMypageListCardUnsaveClick = (item: UsedProductResponse) => {
  trackEvent(GA_EVENTS.mypage.LIST_CARD_UNSAVE_CLICK, {
    ...mypageScreenParams(),
    ...getProductCardIdNameParams(toProductCardInputFromUsedListProduct(item)),
  });
};

export const trackMypageTabSavedItemClick = () => {
  trackEvent(GA_EVENTS.mypage.TAB_SAVED_ITEM_CLICK);
};

export const trackMypageTabGenImgClick = () => {
  trackEvent(GA_EVENTS.mypage.TAB_GEN_IMG_CLICK);
};

export const trackMypageBtnBackClick = () => {
  trackEvent(GA_EVENTS.mypage.BTN_BACK_CLICK, {
    ...mypageScreenParams(),
    ...mypageReturnScreenParams(),
  });
};

export const trackMypageCardGenImgClick = (item: ItemResponse) => {
  trackEvent(GA_EVENTS.mypage.CARD_GEN_IMG_CLICK, {
    ...mypageScreenParams(),
    ...mypageReturnScreenParams(),
    ...getMypageGenImgItemParams(item),
  });
};

export const trackMypageListGenImgView = (groups: DateGroupResponse[]) => {
  trackEvent(GA_EVENTS.mypage.LIST_GEN_IMG_VIEW, {
    ...mypageScreenParams(),
    ...getMypageGenImgListParams(groups),
  });
};

export const trackMypageListSavedItemView = (items: JjymV2ItemResponse[]) => {
  trackEvent(GA_EVENTS.mypage.LIST_SAVED_ITEM_VIEW, {
    ...mypageScreenParams(),
    ...getMypageSavedItemsListParams(items),
  });
};

export const trackMypageBtnMoreGenImgClick = (item: ItemResponse) => {
  trackEvent(GA_EVENTS.mypage.BTN_MORE_GEN_IMG_CLICK, {
    ...mypageScreenParams(),
    ...mypageReturnScreenParams(),
    ...getMypageGenImgItemParams(item),
  });
};

export const trackMypageSlideGenImgItemScroll = ({
  item,
  usedProducts,
}: {
  item: ItemResponse;
  usedProducts: UsedProductResponse[];
}) => {
  const selectedProductIds = joinAnalyticsIds(
    usedProducts
      .filter((product) => product.rawProductId != null)
      .map((product) => ({ id: product.rawProductId! }))
  );

  trackEvent(GA_EVENTS.mypage.SLIDE_GEN_IMG_ITEM_SCROLL, {
    ...getMypageGenImgItemParams(item),
    selected_product_ids: selectedProductIds,
  });
};

export const trackMypageBtnSettingClick = () => {
  trackEvent(GA_EVENTS.mypage.BTN_SETTING_CLICK);
};

export const trackMypageListEmptyGenImgView = () => {
  trackEvent(GA_EVENTS.mypage.LIST_EMPTY_GEN_IMG_VIEW, {
    ...mypageScreenParams(),
    ...getMypageEmptyGenImgListParams(),
  });
};

export const trackMypageListEmptySavedItemView = (
  items: Pick<JjymV2ItemResponse, 'rawProductId' | 'catalogItemId'>[] = []
) => {
  trackEvent(GA_EVENTS.mypage.LIST_EMPTY_SAVED_ITEM_VIEW, {
    ...mypageScreenParams(),
    ...getMypageSavedItemsListParams(items),
  });
};

export const trackMypageBtnCtaEmptyGenImgClick = () => {
  trackEvent(GA_EVENTS.mypage.BTN_CTA_EMPTY_GEN_IMG_CLICK, {
    ...mypageScreenParams(),
    ...mypageReturnScreenParams(),
  });
};

export const trackMypageBtnTextEmptyGenImgClick = () => {
  trackEvent(GA_EVENTS.mypage.BTN_TEXT_EMPTY_GEN_IMG_CLICK, {
    ...mypageScreenParams(),
    ...mypageReturnScreenParams(),
  });
};

export const trackMypageBtnCtaEmptySavedItemClick = () => {
  trackEvent(GA_EVENTS.mypage.BTN_CTA_EMPTY_SAVED_ITEM_CLICK, {
    ...mypageScreenParams(),
    ...mypageReturnScreenParams(),
  });
};

export const trackMypageBtnTextEmptySavedItemClick = () => {
  trackEvent(GA_EVENTS.mypage.BTN_TEXT_EMPTY_SAVED_ITEM_CLICK, {
    ...mypageScreenParams(),
    ...mypageReturnScreenParams(),
  });
};

export {
  getMypageGenImgItemParams,
  getMypageGenImgListParams,
  getMypageEmptyGenImgListParams,
  getMypageSavedItemsListParams,
  mypageReturnScreenParams,
  mypageScreenParams,
} from '@pages/mypage/analytics/mypageAnalyticsParams';
