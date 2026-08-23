import type { ProductFilterValues } from '@pages/home/hooks/useProductFilterState';
import type {
  AppliedFilterChip,
  SelectedProduct,
} from '@pages/home/types/productTab';
import { ALL_FILTER_SENTINEL } from '@pages/home/utils/productFilterUtils';

import { getProductCardOnCardParams } from '@analytics/params/builders/productCard';
import { type CountTriggerEvent } from '@analytics/params/shop';
import { SCREEN_NAME } from '@analytics/screenNames';
import { toSheetExpansionStatus } from '@analytics/utils/imageFlow/formatFunnelGaParams';
import { loginStatusParams } from '@analytics/utils/loginStatus';
import { toAnalyticsNull } from '@analytics/utils/toAnalyticsNull';

import { resolveShopTriggerContext } from './resolveShopTriggerContext';

type FilterLabelMap = Record<string, string>;

export interface ShopListContext {
  searchKeyword?: string;
  appliedValues?: ProductFilterValues;
  appliedFilterChips?: AppliedFilterChip[];
  furnitureLabels?: FilterLabelMap;
  priceLabels?: FilterLabelMap;
  colorLabels?: FilterLabelMap;
  productCount?: number | null;
  productCountViewed?: number;
}

export interface ShopSelectSheetContext extends ShopListContext {
  sheetExpanded: boolean;
  sheetCollapsed?: boolean;
  selectedProducts: SelectedProduct[];
  countTriggerEvent?: CountTriggerEvent;
}

export const shopScreenParams = () => ({
  screen_name: SCREEN_NAME.SHOP,
});

const labelsFromIds = (ids: string[] | undefined, labels: FilterLabelMap) => {
  if (!ids?.length) return null;

  const formatted = ids
    .filter((id) => id !== ALL_FILTER_SENTINEL)
    .map((id) => labels[id] ?? id)
    .filter(Boolean)
    .join(', ');

  return formatted || null;
};

type ShopListParamsOptions = {
  includeLoginStatus?: boolean;
  includeTriggerContext?: boolean;
  includeProductCountViewed?: boolean;
  isEmptyList?: boolean;
  sheetExpanded?: boolean;
};

export const formatSelectedProductIds = (products: SelectedProduct[]) =>
  products.length > 0
    ? products.map((product) => product.id).join(', ')
    : undefined;

export const formatSelectedShopKeywordFilters = (
  appliedFilterChips?: AppliedFilterChip[]
) => {
  const selected = appliedFilterChips
    ?.filter((chip) => chip.applied)
    .map((chip) => chip.label)
    .join(', ');

  return toAnalyticsNull(selected);
};

export const getShopListContextParams = (
  {
    searchKeyword,
    appliedValues,
    appliedFilterChips,
    furnitureLabels = {},
    priceLabels = {},
    colorLabels = {},
    productCount,
    productCountViewed,
  }: ShopListContext = {},
  options?: ShopListParamsOptions
) => {
  return {
    ...(options?.includeLoginStatus ? loginStatusParams() : {}),
    ...shopScreenParams(),
    search_keyword: toAnalyticsNull(searchKeyword?.trim()),
    selected_shop_keyword_filters:
      formatSelectedShopKeywordFilters(appliedFilterChips),
    filter_shop_furniture_type: labelsFromIds(
      appliedValues?.furnitureTypeIds,
      furnitureLabels
    ),
    filter_shop_price: labelsFromIds(appliedValues?.priceRangeIds, priceLabels),
    filter_shop_color: labelsFromIds(appliedValues?.colorIds, colorLabels),
    product_count: productCount,
    ...(options?.includeProductCountViewed
      ? { product_count_viewed: productCountViewed }
      : {}),
    ...(options?.includeTriggerContext
      ? {
          trigger_context: resolveShopTriggerContext({
            searchKeyword,
            appliedValues,
            appliedFilterChips,
            isEmptyList: options.isEmptyList,
          }),
        }
      : {}),
    ...(options?.sheetExpanded !== undefined
      ? {
          sheet_expansion_status: toSheetExpansionStatus(options.sheetExpanded),
        }
      : {}),
  };
};

export const getShopSelectSheetBaseParams = (
  {
    sheetExpanded,
    sheetCollapsed = false,
    selectedProducts,
    countTriggerEvent,
  }: Pick<
    ShopSelectSheetContext,
    | 'sheetExpanded'
    | 'sheetCollapsed'
    | 'selectedProducts'
    | 'countTriggerEvent'
  >,
  options?: Pick<ShopListParamsOptions, 'includeLoginStatus'>
) => {
  return {
    ...(options?.includeLoginStatus ? loginStatusParams() : {}),
    ...shopScreenParams(),
    sheet_expansion_status: toSheetExpansionStatus(
      sheetExpanded,
      sheetCollapsed
    ),
    selected_count: selectedProducts.length,
    selected_product_ids: formatSelectedProductIds(selectedProducts),
    ...(countTriggerEvent ? { count_trigger_event: countTriggerEvent } : {}),
  };
};

export const getShopSelectSheetParams = (
  context: ShopSelectSheetContext,
  options?: Pick<ShopListParamsOptions, 'includeLoginStatus'>
) => getShopSelectSheetBaseParams(context, options);

export const getShopSelectedProductFields = (
  product: Pick<
    SelectedProduct,
    'id' | 'title' | 'discountPrice' | 'categoryName' | 'subCategoryName'
  >
) => ({
  product_id: product.id,
  product_name: product.title,
  ...(product.categoryName ? { product_category: product.categoryName } : {}),
  ...(product.subCategoryName
    ? { product_sub_category: product.subCategoryName }
    : {}),
  product_price: product.discountPrice,
});

export const getShopProductCardParams = (product: {
  id: number;
  title?: string;
  brand?: string;
  originalPrice?: number;
  discountPrice?: number;
  categoryName?: string;
}) =>
  getProductCardOnCardParams({
    productId: product.id,
    name: product.title,
    brand: product.brand,
    originalPrice: product.originalPrice,
    finalPrice: product.discountPrice,
    product_category: product.categoryName,
  });

export const formatNextSelectedProductIds = (
  productId: number,
  selectedProductIds?: string
) => {
  if (!selectedProductIds?.trim()) {
    return String(productId);
  }

  const ids = selectedProductIds.split(',').map((id) => id.trim());
  if (ids.includes(String(productId))) {
    return selectedProductIds;
  }

  return `${selectedProductIds}, ${productId}`;
};
