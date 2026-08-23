import { GA_EVENTS } from '@analytics/events';
import {
  getProductCardIdNameParams,
  getProductCardOnCardParams,
  joinAnalyticsIds,
} from '@analytics/params/builders/productCard';
import type { ProductCardInput } from '@analytics/params/builders/productCard';
import { SCREEN_NAME } from '@analytics/screenNames';
import { trackEvent } from '@analytics/track';
import { toResultPreferenceType } from '@analytics/utils/imageFlow/formatFunnelGaParams';
import { getReturnScreenNameParams } from '@analytics/utils/screenName/buildReturnScreenParams';

import type {
  FurnitureCategoryResponse,
  ProductInfo,
} from '@apis/__generated__/data-contracts';

const resultRecScreenParams = () => ({
  screen_name: SCREEN_NAME.RESULT_REC,
});

export const joinCategoryIds = (
  categories: Pick<FurnitureCategoryResponse, 'id'>[]
) => joinAnalyticsIds(categories);

export const joinProductNames = (products: Pick<ProductInfo, 'name'>[]) =>
  products
    .map((product) => product.name)
    .filter((name): name is string => Boolean(name))
    .join(', ') || undefined;

const categoryChipParams = ({
  categories,
  selectedCategoryId,
}: {
  categories: FurnitureCategoryResponse[];
  selectedCategoryId?: number | null;
}) => {
  const selectedCategory =
    categories.find((category) => category.id === selectedCategoryId) ??
    categories[0];

  return {
    result_category_chip: selectedCategory?.categoryName,
  };
};

const recommendedProductParams = (products: ProductInfo[]) => ({
  recommended_product_ids: joinAnalyticsIds(products),
  recommended_product_names: joinProductNames(products),
});

export const trackResultRecBtnBackClick = () => {
  trackEvent(GA_EVENTS.resultRec.BTN_BACK_CLICK, {
    ...resultRecScreenParams(),
    ...getReturnScreenNameParams(SCREEN_NAME.HOME),
  });
};

export const trackResultRecFeedCardOnCardClick = (
  product: ProductCardInput
) => {
  trackEvent(GA_EVENTS.resultRec.FEED_CARDON_CARD_CLICK, {
    ...resultRecScreenParams(),
    ...getProductCardOnCardParams(product),
  });
};

export const trackResultRecListRecView = ({
  categories,
  selectedCategoryId,
  products,
}: {
  categories: FurnitureCategoryResponse[];
  selectedCategoryId: number | null;
  products: ProductInfo[];
}) => {
  trackEvent(GA_EVENTS.resultRec.LIST_REC_VIEW, {
    ...resultRecScreenParams(),
    ...recommendedProductParams(products),
    ...categoryChipParams({ categories, selectedCategoryId }),
  });
};

export const trackResultRecFeedCardGoSiteClick = (
  product: ProductCardInput
) => {
  trackEvent(GA_EVENTS.resultRec.FEED_CARD_GO_SITE_CLICK, {
    ...resultRecScreenParams(),
    ...getProductCardIdNameParams(product),
  });
};

export const trackResultRecFeedCardSaveClick = (product: ProductCardInput) => {
  trackEvent(GA_EVENTS.resultRec.FEED_CARD_SAVE_CLICK, {
    ...resultRecScreenParams(),
    ...getProductCardIdNameParams(product),
  });
};

export const trackResultRecFeedCardUnsaveClick = (
  product: ProductCardInput
) => {
  trackEvent(GA_EVENTS.resultRec.FEED_CARD_UNSAVE_CLICK, {
    ...resultRecScreenParams(),
    ...getProductCardIdNameParams(product),
  });
};

export const trackResultRecBtnArrowRightClick = () => {
  trackEvent(GA_EVENTS.resultRec.BTN_ARROW_RIGHT_CLICK);
};

export const trackResultRecBtnArrowLeftClick = () => {
  trackEvent(GA_EVENTS.resultRec.BTN_ARROW_LEFT_CLICK);
};

export const trackResultRecSlideFilterCombView = ({
  categories,
  selectedCategoryId,
}: {
  categories: FurnitureCategoryResponse[];
  selectedCategoryId?: number | null;
}) => {
  trackEvent(GA_EVENTS.resultRec.SLIDE_FILTER_COMB_VIEW, {
    ...resultRecScreenParams(),
    result_category_ids: joinCategoryIds(categories),
    ...categoryChipParams({ categories, selectedCategoryId }),
  });
};

export const trackResultRecChipFilterSelected = ({
  categories,
  selectedCategoryId,
}: {
  categories: FurnitureCategoryResponse[];
  selectedCategoryId: number;
}) => {
  trackEvent(GA_EVENTS.resultRec.CHIP_FILTER_SELECTED, {
    ...resultRecScreenParams(),
    result_category_ids: joinCategoryIds(categories),
    ...categoryChipParams({ categories, selectedCategoryId }),
  });
};

export const trackResultRecBtnMoreImgClick = () => {
  trackEvent(GA_EVENTS.resultRec.BTN_MORE_IMG_CLICK);
};

export const trackResultRecMdNotYetView = () => {
  trackEvent(GA_EVENTS.resultRec.MD_NOT_YET_VIEW);
};

export const trackResultRecBtnPreferenceClick = ({
  genImgId,
  isLike,
}: {
  genImgId: number;
  isLike: boolean;
}) => {
  trackEvent(GA_EVENTS.resultRec.BTN_PREFERENCE_CLICK, {
    ...resultRecScreenParams(),
    gen_img_id: genImgId,
    result_preference_type: toResultPreferenceType(isLike),
  });
};

export const trackResultRecToastThxOpinionView = () => {
  trackEvent(GA_EVENTS.resultRec.TOAST_THX_OPINION_VIEW);
};
