import {
  formatNextSelectedProductIds,
  formatSelectedShopKeywordFilters,
  getShopListContextParams,
  getShopProductCardParams,
  getShopSelectSheetBaseParams,
  getShopSelectSheetParams,
  getShopSelectedProductFields,
  shopScreenParams,
  type ShopListContext,
  type ShopSelectSheetContext,
} from '@pages/home/analytics/shopAnalyticsParams';
import type { ProductSearchCardItem } from '@pages/home/hooks/useProductSearch';
import type {
  ProductFilterChipCategory,
  SelectedProduct,
} from '@pages/home/types/productTab';

import { GA_EVENTS } from '@analytics/events';
import { getProductCardIdNameParams } from '@analytics/params/builders/productCard';
import type { ImageEntryRoute } from '@analytics/params/gate';
import {
  COUNT_TRIGGER_EVENT,
  SHEET_EXPANSION_STATUS,
  type SheetExpansionStatus,
} from '@analytics/params/shop';
import { type ScreenName } from '@analytics/screenNames';
import { trackEvent } from '@analytics/track';
import { toSheetExpansionStatus } from '@analytics/utils/imageFlow/formatFunnelGaParams';
import { loginStatusParams } from '@analytics/utils/loginStatus';
import { toAnalyticsNull } from '@analytics/utils/toAnalyticsNull';

export const trackShopFilterListClick = (
  category: ProductFilterChipCategory
) => {
  trackEvent(GA_EVENTS.shop.FILTER_LIST_CLICK, {
    ...shopScreenParams(),
    ...loginStatusParams(),
    filter_type: category,
  });
};

export const trackShopFilterSheetView = (
  listContext: ShopListContext = {},
  sheetExpanded: boolean
) => {
  trackEvent(GA_EVENTS.shop.FILTER_SHT_VIEW, {
    ...loginStatusParams(),
    ...shopScreenParams(),
    selected_shop_keyword_filters: formatSelectedShopKeywordFilters(
      listContext.appliedFilterChips
    ),
    sheet_expansion_status: toSheetExpansionStatus(sheetExpanded),
  });
};

export const trackShopFilterSheetSubmit = (
  listContext: ShopListContext,
  sheetExpanded: boolean
) => {
  trackEvent(
    GA_EVENTS.shop.FILTER_SHT_SUBMIT,
    getShopListContextParams(listContext, {
      includeLoginStatus: true,
      includeTriggerContext: true,
      sheetExpanded,
    })
  );
};

export const trackShopFilterSheetResetClick = (
  listContext: ShopListContext,
  sheetExpanded: boolean
) => {
  trackEvent(
    GA_EVENTS.shop.FILTER_SHT_RESET_CLICK,
    getShopListContextParams(listContext, {
      includeLoginStatus: true,
      includeTriggerContext: true,
      sheetExpanded,
    })
  );
};

export const trackShopSearchBarClick = () => {
  trackEvent(GA_EVENTS.shop.SEARCH_BAR_CLICK, shopScreenParams());
};

export const trackShopSearchSubmit = (listContext: ShopListContext) => {
  trackEvent(
    GA_EVENTS.shop.SEARCH_SUBMIT,
    getShopListContextParams(listContext, {
      includeLoginStatus: true,
      includeTriggerContext: true,
    })
  );
};

export const trackShopSearchClear = (listContext: ShopListContext) => {
  trackEvent(
    GA_EVENTS.shop.SEARCH_CLEAR,
    getShopListContextParams(listContext, {
      includeLoginStatus: true,
      includeTriggerContext: true,
    })
  );
};

export const trackShopSelectSheetAddItemClick = (
  context: ShopSelectSheetContext
) => {
  trackEvent(
    GA_EVENTS.shop.SELECT_SHEET_ADD_ITEM_CLICK,
    getShopSelectSheetParams(context, { includeLoginStatus: true })
  );
};

export const trackShopSelectSheetRemoveClick = (
  context: ShopSelectSheetContext,
  product: Pick<
    SelectedProduct,
    'id' | 'title' | 'discountPrice' | 'categoryName' | 'subCategoryName'
  >
) => {
  trackEvent(GA_EVENTS.shop.SELECT_SHEET_REMOVE_CLICK, {
    ...getShopSelectSheetBaseParams(context, { includeLoginStatus: true }),
    ...getShopSelectedProductFields(product),
  });
};

export const trackShopSelectSheetItemClick = (
  context: ShopSelectSheetContext,
  product: Pick<
    SelectedProduct,
    'id' | 'title' | 'discountPrice' | 'categoryName' | 'subCategoryName'
  >
) => {
  trackEvent(GA_EVENTS.shop.SELECT_SHEET_ITEM_CLICK, {
    ...getShopSelectSheetBaseParams(context, { includeLoginStatus: true }),
    ...getShopSelectedProductFields(product),
  });
};

export interface ShopSelectSheetCtaContext extends ShopListContext {
  sheetExpanded: boolean;
  sheetCollapsed?: boolean;
  selectedProducts: SelectedProduct[];
  imageEntryRoute?: ImageEntryRoute;
  returnScreenName: ScreenName;
  hasPreviousSpace: boolean;
  hasPreviousImage: boolean;
}

export const trackShopSelectSheetCtaClick = ({
  sheetExpanded,
  sheetCollapsed = false,
  selectedProducts,
  imageEntryRoute,
  returnScreenName,
  hasPreviousSpace,
  hasPreviousImage,
}: ShopSelectSheetCtaContext) => {
  const lastProduct = selectedProducts[selectedProducts.length - 1];

  trackEvent(GA_EVENTS.shop.SELECT_SHEET_CTA_CLICK, {
    ...getShopSelectSheetBaseParams(
      { sheetExpanded, sheetCollapsed, selectedProducts },
      { includeLoginStatus: true }
    ),
    ...getShopSelectedProductFields(lastProduct),
    image_entry_route: imageEntryRoute,
    return_screen_name: returnScreenName,
    has_previous_space: hasPreviousSpace,
    has_previous_image: hasPreviousImage,
  });
};

export const trackShopFeedCardSelectClick = (
  product: SelectedProduct,
  selectedProductIds?: string
) => {
  trackEvent(GA_EVENTS.shop.FEED_CARD_SELECT_CLICK, {
    ...shopScreenParams(),
    ...getShopProductCardParams(product),
    selected_product_ids: selectedProductIds,
  });
};

export const trackShopFeedCardDetailClick = (
  product: ProductSearchCardItem | SelectedProduct,
  selectedProductIds?: string
) => {
  trackEvent(GA_EVENTS.shop.FEED_CARD_DETAIL_CLICK, {
    ...shopScreenParams(),
    ...getShopProductCardParams(product),
    selected_product_ids: toAnalyticsNull(selectedProductIds),
  });
};

export const trackShopFeedCardUnselectClick = () => {
  trackEvent(GA_EVENTS.shop.FEED_CARD_UNSELECT_CLICK, shopScreenParams());
};

export const trackShopListProductView = (listContext?: ShopListContext) => {
  trackEvent(
    GA_EVENTS.shop.LIST_PRODUCT_VIEW,
    getShopListContextParams(listContext, {
      includeLoginStatus: true,
      includeTriggerContext: true,
    })
  );
};

export const trackShopListEmptyView = (listContext?: ShopListContext) => {
  trackEvent(
    GA_EVENTS.shop.LIST_EMPTY_VIEW,
    getShopListContextParams(listContext, {
      includeLoginStatus: true,
      includeTriggerContext: true,
      isEmptyList: true,
    })
  );
};

export const trackShopFeedDetailMdView = () => {
  trackEvent(GA_EVENTS.shop.FEED_DETAIL_MD_VIEW, shopScreenParams());
};

export const trackShopFeedDetailMdSelectClick = (
  product: {
    id: number;
    title?: string;
    brand?: string;
    discountPrice?: number;
    categoryName?: string;
  },
  selectedProductIds?: string
) => {
  trackEvent(GA_EVENTS.shop.FEED_DETAIL_MD_SELECT_CLICK, {
    ...shopScreenParams(),
    ...getShopProductCardParams(product),
    selected_product_ids: formatNextSelectedProductIds(
      product.id,
      selectedProductIds
    ),
  });
};

export const trackShopFeedDetailMdSaveClick = (product: {
  id: number;
  title?: string;
}) => {
  trackEvent(GA_EVENTS.shop.FEED_DETAIL_MD_SAVE_CLICK, {
    ...shopScreenParams(),
    ...getProductCardIdNameParams({
      productId: product.id,
      name: product.title,
    }),
  });
};

export const trackShopFeedDetailMdUnsaveClick = (product: {
  id: number;
  title?: string;
}) => {
  trackEvent(GA_EVENTS.shop.FEED_DETAIL_MD_UNSAVE_CLICK, {
    ...shopScreenParams(),
    ...getProductCardIdNameParams({
      productId: product.id,
      name: product.title,
    }),
  });
};

export const trackShopFeedDetailMdGoSiteClick = (product: {
  id: number;
  title?: string;
  brand?: string;
  categoryName?: string;
  discountPrice?: number;
}) => {
  trackEvent(GA_EVENTS.shop.FEED_DETAIL_MD_GO_SITE_CLICK, {
    ...shopScreenParams(),
    ...getShopProductCardParams(product),
  });
};

export const trackShopFeedDetailMdCloseClick = () => {
  trackEvent(GA_EVENTS.shop.FEED_DETAIL_MD_CLOSE_CLICK, shopScreenParams());
};

export const trackShopSelectSheetSwipe = (
  eventName:
    | typeof GA_EVENTS.shop.SELECT_SHEET_SWIPE_UP
    | typeof GA_EVENTS.shop.SELECT_SHEET_SWIPE_DOWN,
  context: ShopSelectSheetContext
) => {
  trackEvent(eventName, getShopSelectSheetParams(context));
};

export const trackShopSelectSheetItemCountChange = (
  context: ShopSelectSheetContext
) => {
  trackEvent(
    GA_EVENTS.shop.SELECT_SHEET_ITEM_COUNT_CHANGE,
    getShopSelectSheetParams(context)
  );
};

// 기존 import 경로 호환 — params 빌더/타입·shop enum 재노출
export {
  getShopListContextParams,
  getShopProductCardParams,
  getShopSelectSheetParams,
  shopScreenParams,
  type ShopListContext,
  type ShopSelectSheetContext,
} from '@pages/home/analytics/shopAnalyticsParams';
export { COUNT_TRIGGER_EVENT, SHEET_EXPANSION_STATUS };
export type { SheetExpansionStatus };
