import { useCallback, useEffect, useMemo, useRef } from 'react';

import {
  trackResultListBtnReselectClick,
  trackResultListFeedCardGoSiteClick,
  trackResultListFeedCardOnCardClick,
  trackResultListFeedCardSaveClick,
  trackResultListFeedCardUnsaveClick,
  trackResultListImgCardOnCardClick,
  trackResultListListCardClick,
  trackResultListListCardGoSiteClick,
  trackResultListListCardSaveClick,
  trackResultListListCardUnsaveClick,
  trackResultListListLookAroundView,
  trackResultListListOthersImgView,
  trackResultListListSelectedView,
} from '@pages/generate/analytics/resultListAnalytics';

import {
  joinAnalyticsIds,
  toProductCardInputFromGenerateResultProduct,
  toProductCardInputFromSimilarItem,
} from '@analytics/params/builders/productCard';

import type {
  GenerateImageResultProductResponse,
  RelatedImageResponse,
  SimilarItemResponse,
} from '@apis/__generated__/data-contracts';

type SectionDisplayState =
  | 'loading'
  | 'error'
  | 'empty'
  | 'partial'
  | 'content';

interface UseResultListAnalyticsOptions {
  genImgId: number;
  /** 연관 이미지 클릭 시 gen_img_id — 결과 페이지 최초 진입 이미지 */
  entryGenImgId: number;
  selectedState: SectionDisplayState;
  similarState: SectionDisplayState;
  relatedState: SectionDisplayState;
  renderableSelectedProducts: GenerateImageResultProductResponse[];
  renderableSimilarProducts: SimilarItemResponse[];
  renderableRelatedImages: RelatedImageResponse[];
}

/**
 * 목록형 결과 페이지 GA — view 이벤트 + 클릭/찜 핸들러 래핑
 */
const useResultListAnalytics = ({
  genImgId,
  entryGenImgId,
  selectedState,
  similarState,
  relatedState,
  renderableSelectedProducts,
  renderableSimilarProducts,
  renderableRelatedImages,
}: UseResultListAnalyticsOptions) => {
  const selectedProductIdsParam = useMemo(
    () => joinAnalyticsIds(renderableSelectedProducts),
    [renderableSelectedProducts]
  );

  const trackedSelectedViewRef = useRef(false);
  const trackedLookAroundViewRef = useRef(false);
  const trackedOthersImgViewRef = useRef(false);

  useEffect(() => {
    trackedSelectedViewRef.current = false;
    trackedLookAroundViewRef.current = false;
    trackedOthersImgViewRef.current = false;
  }, [genImgId]);

  useEffect(() => {
    if (selectedState !== 'content' || trackedSelectedViewRef.current) return;

    trackedSelectedViewRef.current = true;
    trackResultListListSelectedView(selectedProductIdsParam);
  }, [selectedProductIdsParam, selectedState]);

  useEffect(() => {
    if (similarState !== 'content' || trackedLookAroundViewRef.current) return;

    trackedLookAroundViewRef.current = true;
    trackResultListListLookAroundView(
      joinAnalyticsIds(renderableSimilarProducts)
    );
  }, [renderableSimilarProducts, similarState]);

  useEffect(() => {
    if (relatedState !== 'content' || trackedOthersImgViewRef.current) return;

    trackedOthersImgViewRef.current = true;
    trackResultListListOthersImgView(joinAnalyticsIds(renderableRelatedImages));
  }, [relatedState, renderableRelatedImages]);

  const wrapReselectClick = useCallback(
    (onReselect: () => void) => () => {
      trackResultListBtnReselectClick(selectedProductIdsParam);
      onReselect();
    },
    [selectedProductIdsParam]
  );

  const handleSelectedListCardClick = useCallback(
    (item: GenerateImageResultProductResponse) => {
      trackResultListListCardClick(
        toProductCardInputFromGenerateResultProduct(item)
      );
    },
    []
  );

  const handleSelectedListCardGoSiteClick = useCallback(
    (item: GenerateImageResultProductResponse) => {
      trackResultListListCardGoSiteClick(
        toProductCardInputFromGenerateResultProduct(item)
      );
    },
    []
  );

  const handleSelectedListCardSaveToggle = useCallback(
    (item: GenerateImageResultProductResponse, isSaved: boolean) => {
      const product = toProductCardInputFromGenerateResultProduct(item);
      if (isSaved) {
        trackResultListListCardUnsaveClick(product);
      } else {
        trackResultListListCardSaveClick(product);
      }
    },
    []
  );

  const handleSimilarFeedCardClick = useCallback(
    (item: SimilarItemResponse) => {
      trackResultListFeedCardOnCardClick(
        toProductCardInputFromSimilarItem(item)
      );
    },
    []
  );

  const handleSimilarFeedCardGoSiteClick = useCallback(
    (item: SimilarItemResponse) => {
      trackResultListFeedCardGoSiteClick(
        toProductCardInputFromSimilarItem(item)
      );
    },
    []
  );

  const handleSimilarFeedCardSaveToggle = useCallback(
    (item: SimilarItemResponse, isSaved: boolean) => {
      const product = toProductCardInputFromSimilarItem(item);
      if (isSaved) {
        trackResultListFeedCardUnsaveClick(product);
      } else {
        trackResultListFeedCardSaveClick(product);
      }
    },
    []
  );

  const handleRelatedImageClick = useCallback(
    (othersImgId: number) => {
      trackResultListImgCardOnCardClick({
        genImgId: entryGenImgId,
        selectedProductIds: selectedProductIdsParam,
        othersImgId,
      });
    },
    [entryGenImgId, selectedProductIdsParam]
  );

  return {
    wrapReselectClick,
    handleSelectedListCardClick,
    handleSelectedListCardGoSiteClick,
    handleSelectedListCardSaveToggle,
    handleSimilarFeedCardClick,
    handleSimilarFeedCardGoSiteClick,
    handleSimilarFeedCardSaveToggle,
    handleRelatedImageClick,
  };
};

export { useResultListAnalytics };
