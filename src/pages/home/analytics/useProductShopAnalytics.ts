import { useCallback, useEffect, useMemo, useRef } from 'react';

import {
  COUNT_TRIGGER_EVENT,
  getShopListContextParams,
  type ShopListContext,
  trackShopFilterListClick,
  trackShopFilterSheetResetClick,
  trackShopFilterSheetSubmit,
  trackShopFilterSheetView,
  trackShopSearchBarClick,
  trackShopSearchClear,
  trackShopSearchSubmit,
  trackShopSelectSheetAddItemClick,
  trackShopSelectSheetCtaClick,
  trackShopSelectSheetItemClick,
  trackShopSelectSheetItemCountChange,
  trackShopSelectSheetRemoveClick,
  trackShopSelectSheetSwipe,
} from '@pages/home/analytics/shopAnalytics';
import { useShopAnalyticsContext } from '@pages/home/analytics/useShopAnalyticsContext';
import {
  MAX_SELECTED_PRODUCTS,
  type ProductTabController,
} from '@pages/home/hooks/useProductTabController';
import type { SelectedProduct } from '@pages/home/types/productTab';

import { GA_EVENTS } from '@analytics/events';
import { useAnalyticsPageView } from '@analytics/hooks/useAnalyticsPageView';
import { SCREEN_NAME } from '@analytics/screenNames';

import { useRecentFloorPlanQuery } from '@apis/queries/useRecentFloorPlanQuery';

import { resolveShopImageEntryRoute } from './resolveShopEntryRoute';

interface UseProductShopAnalyticsOptions {
  productCountViewed: number;
  onProductViewedCountChange: (count: number) => void;
  sheetCollapsed?: boolean;
}

/**
 * 상품 탭 GA — controller 비즈니스 핸들러에 이벤트 전송을 래핑
 */
const useProductShopAnalytics = (
  controller: ProductTabController,
  {
    productCountViewed,
    onProductViewedCountChange,
    sheetCollapsed = false,
  }: UseProductShopAnalyticsOptions
) => {
  const { data: recentFloorPlanData } = useRecentFloorPlanQuery();

  const {
    sheetExpanded,
    setSheetExpanded: setSheetExpandedState,
    selectedProducts,
    debouncedKeyword,
    isPending,
    isFetching,
    isError,
    isRecommended,
    products,
    handleFilterChipClick,
    handleFilterApply,
    handleFilterResetClick,
    handleSelectProduct,
    handleRemoveSelectedProduct,
    handleDecorateWithProductsClick,
    handleSearchKeywordChange,
  } = controller;

  const {
    productCountViewedRef,
    selectedProductsRef,
    enrichProductSubCategory,
    getShopListContext,
    getSelectSheetContext,
    getSelectSheetContextRef,
    shopListContext,
  } = useShopAnalyticsContext({
    controller,
    productCountViewed,
    sheetCollapsed,
  });

  const shopPageParams = useMemo(
    () =>
      getShopListContextParams(shopListContext, {
        includeLoginStatus: true,
        includeTriggerContext: true,
      }),
    [shopListContext]
  );

  useAnalyticsPageView(
    GA_EVENTS.shop.PAGE_VIEW,
    SCREEN_NAME.SHOP,
    shopPageParams
  );

  // 검색어 디바운스 후 결과가 표시될 때마다 search_submit (Enter 키에만 의존하지 않음)
  const lastTrackedSearchKeywordRef = useRef<string | null>(null);

  useEffect(() => {
    const trimmed = debouncedKeyword.trim();
    if (!trimmed) {
      lastTrackedSearchKeywordRef.current = null;
      return;
    }
    if (isPending || isError) return;
    if (lastTrackedSearchKeywordRef.current === trimmed) return;

    lastTrackedSearchKeywordRef.current = trimmed;
    trackShopSearchSubmit(getShopListContext());
  }, [debouncedKeyword, getShopListContext, isError, isPending]);

  const pendingFilterSubmitRef = useRef<{
    applied: Pick<ShopListContext, 'appliedValues' | 'appliedFilterChips'>;
    sheetExpanded: boolean;
  } | null>(null);

  useEffect(() => {
    const pending = pendingFilterSubmitRef.current;
    if (!pending) return;
    if (isPending || isFetching) return;
    if (isError) {
      pendingFilterSubmitRef.current = null;
      return;
    }

    pendingFilterSubmitRef.current = null;
    trackShopFilterSheetSubmit(
      getShopListContext({
        ...pending.applied,
        // isRecommended=true면 필터 결과 없음(추천 섹션만 노출) → 추천 상품 수 제외
        productCount: isRecommended ? null : products.length,
      }),
      pending.sheetExpanded
    );
  }, [
    getShopListContext,
    isError,
    isFetching,
    isPending,
    isRecommended,
    products.length,
  ]);

  const trackSelectSheetCountChange = useCallback(
    (
      nextProducts: SelectedProduct[],
      countTriggerEvent: (typeof COUNT_TRIGGER_EVENT)[keyof typeof COUNT_TRIGGER_EVENT]
    ) => {
      trackShopSelectSheetItemCountChange(
        getSelectSheetContext({
          selectedProducts: nextProducts,
          countTriggerEvent,
        })
      );
    },
    [getSelectSheetContext]
  );

  const setSheetExpanded = useCallback(
    (nextExpanded: boolean) => {
      setSheetExpandedState((prev) => {
        if (prev === nextExpanded) return prev;

        trackShopSelectSheetSwipe(
          nextExpanded
            ? GA_EVENTS.shop.SELECT_SHEET_SWIPE_UP
            : GA_EVENTS.shop.SELECT_SHEET_SWIPE_DOWN,
          getSelectSheetContextRef.current({ sheetExpanded: nextExpanded })
        );

        return nextExpanded;
      });
    },
    [setSheetExpandedState]
  );

  const handleProductListRender = useCallback(
    (count: number) => {
      productCountViewedRef.current = count;
      onProductViewedCountChange(count);
    },
    [onProductViewedCountChange]
  );

  const handleFilterChipClickWithAnalytics = useCallback(
    (category: Parameters<typeof handleFilterChipClick>[0]) => {
      const wasOpen = controller.chipSelected[category];

      trackShopFilterListClick(category);
      handleFilterChipClick(category);

      if (!wasOpen) {
        trackShopFilterSheetView(getShopListContext(), sheetExpanded);
      }
    },
    [
      controller.chipSelected,
      getShopListContext,
      handleFilterChipClick,
      sheetExpanded,
    ]
  );

  const handleFilterApplyWithAnalytics = useCallback(() => {
    // apply 직후 appliedValues·products는 stale → fetch settle 후 filterSht_submit 발화
    const applied = handleFilterApply();
    pendingFilterSubmitRef.current = { applied, sheetExpanded };
  }, [handleFilterApply, sheetExpanded]);

  const handleFilterResetClickWithAnalytics = useCallback(() => {
    handleFilterResetClick();
    trackShopFilterSheetResetClick(getShopListContext(), sheetExpanded);
  }, [getShopListContext, handleFilterResetClick, sheetExpanded]);

  const handleSelectProductWithAnalytics = useCallback(
    (product: SelectedProduct) => {
      const enrichedProduct = enrichProductSubCategory(product);
      const prev = selectedProductsRef.current;
      if (prev.some((item) => item.id === enrichedProduct.id)) return;

      handleSelectProduct(enrichedProduct);

      if (prev.length >= MAX_SELECTED_PRODUCTS) return;

      trackSelectSheetCountChange(
        [...prev, enrichedProduct],
        COUNT_TRIGGER_EVENT.ADD_CLICK
      );
    },
    [enrichProductSubCategory, handleSelectProduct, trackSelectSheetCountChange]
  );

  const handleRemoveSelectedProductWithAnalytics = useCallback(
    (id: number) => {
      const nextProducts = selectedProductsRef.current.filter(
        (product) => product.id !== id
      );
      const removedProduct = selectedProductsRef.current.find(
        (product) => product.id === id
      );

      if (removedProduct) {
        trackShopSelectSheetRemoveClick(
          getSelectSheetContext(),
          enrichProductSubCategory(removedProduct)
        );
      }

      trackSelectSheetCountChange(
        nextProducts,
        COUNT_TRIGGER_EVENT.REMOVE_CLICK
      );
      handleRemoveSelectedProduct(id);
    },
    [
      enrichProductSubCategory,
      getSelectSheetContext,
      handleRemoveSelectedProduct,
      trackSelectSheetCountChange,
    ]
  );

  const handleAddProductClickWithAnalytics = useCallback(() => {
    if (selectedProducts.length === 0) {
      trackShopSelectSheetAddItemClick(getSelectSheetContext());
    }
    setSheetExpanded(false);
  }, [getSelectSheetContext, selectedProducts.length, setSheetExpanded]);

  const handleSearchBarClick = useCallback(() => {
    trackShopSearchBarClick();
  }, []);

  const handleSearchClear = useCallback(() => {
    trackShopSearchClear(getShopListContext());
    handleSearchKeywordChange('');
  }, [getShopListContext, handleSearchKeywordChange]);

  const handleDecorateWithProductsClickWithAnalytics = useCallback(() => {
    if (selectedProducts.length === 0) {
      handleDecorateWithProductsClick();
      return;
    }

    trackShopSelectSheetCtaClick({
      ...getShopListContext(),
      sheetExpanded,
      sheetCollapsed,
      selectedProducts,
      imageEntryRoute: resolveShopImageEntryRoute(),
      // 상품 탭 CTA의 return screen은 항상 shop 고정 (진입 경로는 image_entry_route로 별도 계산)
      returnScreenName: SCREEN_NAME.SHOP,
      hasPreviousSpace: recentFloorPlanData?.hasRecentImage === true,
      hasPreviousImage: recentFloorPlanData?.hasRecentImage === true,
    });

    handleDecorateWithProductsClick();
  }, [
    getShopListContext,
    handleDecorateWithProductsClick,
    recentFloorPlanData,
    selectedProducts,
    sheetExpanded,
    sheetCollapsed,
  ]);

  const handleSelectSheetItemClick = useCallback(
    (product: SelectedProduct) => {
      trackShopSelectSheetItemClick(
        getSelectSheetContext(),
        enrichProductSubCategory(product)
      );
    },
    [enrichProductSubCategory, getSelectSheetContext]
  );

  return {
    shopListContext,
    setSheetExpanded,
    handleProductListRender,
    handleFilterChipClick: handleFilterChipClickWithAnalytics,
    handleFilterApply: handleFilterApplyWithAnalytics,
    handleFilterResetClick: handleFilterResetClickWithAnalytics,
    handleSelectProduct: handleSelectProductWithAnalytics,
    handleSelectProductFromDetailModal: handleSelectProduct,
    handleRemoveSelectedProduct: handleRemoveSelectedProductWithAnalytics,
    handleAddProductClick: handleAddProductClickWithAnalytics,
    handleDecorateWithProductsClick:
      handleDecorateWithProductsClickWithAnalytics,
    handleSearchBarClick,
    handleSearchClear,
    handleSelectSheetItemClick,
  };
};

export { useProductShopAnalytics };
