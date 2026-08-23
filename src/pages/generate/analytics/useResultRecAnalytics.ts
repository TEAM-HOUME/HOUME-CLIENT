import { useCallback, useEffect, useMemo, useRef } from 'react';

import {
  trackResultRecBtnArrowLeftClick,
  trackResultRecBtnArrowRightClick,
  trackResultRecBtnMoreImgClick,
  trackResultRecBtnPreferenceClick,
  trackResultRecChipFilterSelected,
  trackResultRecFeedCardGoSiteClick,
  trackResultRecFeedCardOnCardClick,
  trackResultRecFeedCardSaveClick,
  trackResultRecFeedCardUnsaveClick,
  trackResultRecListRecView,
  trackResultRecMdNotYetView,
  trackResultRecSlideFilterCombView,
  trackResultRecToastThxOpinionView,
} from '@pages/generate/analytics/resultRecAnalytics';

import {
  joinAnalyticsIds,
  toProductCardInputFromProductInfo,
} from '@analytics/params/builders/productCard';

import type {
  FurnitureCategoryResponse,
  ProductInfo,
  ProductWrapper,
} from '@apis/__generated__/data-contracts';

type SectionDisplayState =
  | 'loading'
  | 'error'
  | 'empty'
  | 'partial'
  | 'content';

const resolveRenderableProducts = (wrappers: ProductWrapper[]) =>
  wrappers
    .map((wrapper) => wrapper.product)
    .filter((product): product is ProductInfo => Boolean(product?.id));

interface UseResultRecAnalyticsOptions {
  currentImageId: number;
  categoriesState: SectionDisplayState;
  productsState: SectionDisplayState;
  selectedCategoryId: number | null;
  renderableCategories: FurnitureCategoryResponse[];
  renderableProducts: ProductWrapper[];
}

/**
 * 추천형 결과 페이지 GA — view 이벤트 + 필터/피드 카드 핸들러 래핑
 */
const useResultRecAnalytics = ({
  currentImageId,
  categoriesState,
  productsState,
  selectedCategoryId,
  renderableCategories,
  renderableProducts,
}: UseResultRecAnalyticsOptions) => {
  const resolvedProducts = useMemo(
    () => resolveRenderableProducts(renderableProducts),
    [renderableProducts]
  );

  const trackedFilterCombRef = useRef(false);
  const trackedListRecKeyRef = useRef<string | null>(null);

  useEffect(() => {
    trackedFilterCombRef.current = false;
    trackedListRecKeyRef.current = null;
  }, [currentImageId]);

  useEffect(() => {
    if (categoriesState !== 'content' || trackedFilterCombRef.current) return;

    trackedFilterCombRef.current = true;
    trackResultRecSlideFilterCombView({
      categories: renderableCategories,
      selectedCategoryId,
    });
  }, [
    categoriesState,
    renderableCategories,
    resolvedProducts,
    selectedCategoryId,
  ]);

  useEffect(() => {
    if (productsState !== 'content' || selectedCategoryId === null) return;

    const listRecKey = `${selectedCategoryId}:${joinAnalyticsIds(resolvedProducts)}`;
    if (trackedListRecKeyRef.current === listRecKey) return;

    trackedListRecKeyRef.current = listRecKey;
    trackResultRecListRecView({
      categories: renderableCategories,
      selectedCategoryId,
      products: resolvedProducts,
    });
  }, [
    productsState,
    renderableCategories,
    resolvedProducts,
    selectedCategoryId,
  ]);

  const handleCategoryChipClick = useCallback(
    (categoryId: number) => {
      if (selectedCategoryId !== categoryId) {
        trackResultRecChipFilterSelected({
          categories: renderableCategories,
          selectedCategoryId: categoryId,
        });
      }
    },
    [renderableCategories, selectedCategoryId]
  );

  const handleFeedCardClick = useCallback((product: ProductInfo) => {
    trackResultRecFeedCardOnCardClick(
      toProductCardInputFromProductInfo(product)
    );
  }, []);

  const handleFeedCardGoSiteClick = useCallback((product: ProductInfo) => {
    trackResultRecFeedCardGoSiteClick(
      toProductCardInputFromProductInfo(product)
    );
  }, []);

  const handleFeedCardSaveToggle = useCallback(
    (product: ProductInfo, isSaved: boolean) => {
      const productInput = toProductCardInputFromProductInfo(product);
      if (isSaved) {
        trackResultRecFeedCardUnsaveClick(productInput);
      } else {
        trackResultRecFeedCardSaveClick(productInput);
      }
    },
    []
  );

  const handleArrowLeftClick = useCallback(() => {
    trackResultRecBtnArrowLeftClick();
  }, []);

  const handleArrowRightClick = useCallback(() => {
    trackResultRecBtnArrowRightClick();
  }, []);

  const handleMoreImgClick = useCallback(() => {
    trackResultRecBtnMoreImgClick();
    trackResultRecMdNotYetView();
  }, []);

  const handlePreferenceClick = useCallback(
    (params: { genImgId: number; isLike: boolean }) => {
      trackResultRecBtnPreferenceClick(params);
    },
    []
  );

  const handleFactorFeedbackThankYou = useCallback(() => {
    trackResultRecToastThxOpinionView();
  }, []);

  return {
    handleCategoryChipClick,
    handleFeedCardClick,
    handleFeedCardGoSiteClick,
    handleFeedCardSaveToggle,
    handleArrowLeftClick,
    handleArrowRightClick,
    handleMoreImgClick,
    handlePreferenceClick,
    handleFactorFeedbackThankYou,
  };
};

export { useResultRecAnalytics };
