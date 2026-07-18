import { useMemo } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { useResultListAnalytics } from '@pages/generate/analytics/useResultListAnalytics';
import { useGenerateListResultQuery } from '@pages/generate/v2/apis/queries/useGenerateListResultQuery';
import { useRelatedImagesQuery } from '@pages/generate/v2/apis/queries/useRelatedImagesQuery';
import { useSimilarItemsQuery } from '@pages/generate/v2/apis/queries/useSimilarItemsQuery';

import { ROUTES } from '@routes/paths';

import { useFunnelStore } from '@store/useFunnelStore';
import { useImageFlowStore } from '@store/useImageFlowStore';
import { useSavedItemsStore } from '@store/useSavedItemsStore';

import { GA_EVENTS } from '@shared/analytics/events';
import { useAnalyticsPageView } from '@shared/analytics/hooks';
import { joinAnalyticsIds } from '@shared/analytics/params/builders/productCard';
import {
  LOGIN_ENTRY_ROUTE,
  IMAGE_ENTRY_ROUTE,
} from '@shared/analytics/params/gate';
import { SCREEN_NAME } from '@shared/analytics/screenNames';
import { getEntryRoute } from '@shared/analytics/utils/imageEntryRoute';
import ActionButton from '@shared/components/v2/button/actionButton/ActionButton';
import EmptyView from '@shared/components/v2/emptyView/EmptyView';
import { EMPTY_VIEW_TEXT } from '@shared/constants/emptyViewText';

import { useJjymMutation } from '@apis/mutations/useJjymMutation';

import InlineError from '@components/inlineError/InlineError';
import Loading from '@components/loading/Loading';

import ListProductCard from '@/shared/components/v2/productCard/ListProductCard';
import ProductCard from '@/shared/components/v2/productCard/ProductCard';
import StyleCard from '@/shared/components/v2/styleCard/StyleCard';

import GeneratedImg from './imgSection/GeneratedImg';
import * as styles from './ListResult.css';
import { toProductItem } from '../../utils/toProductItem';

import type { ResultImageMeta } from '../../types';

type SectionDisplayState =
  | 'loading'
  | 'error'
  | 'empty'
  | 'partial'
  | 'content';

const getSectionDisplayState = ({
  isLoading,
  isError,
  rawCount,
  renderableCount,
}: {
  isLoading: boolean;
  isError: boolean;
  rawCount: number;
  renderableCount: number;
}): SectionDisplayState => {
  if (isLoading) return 'loading';
  if (isError) return 'error';
  if (renderableCount > 0) return 'content';
  if (rawCount > 0) return 'partial';
  return 'empty';
};

const getGenerateResultPath = (houseId: number, viewType: string) =>
  `${ROUTES.GENERATE_RESULT}?${new URLSearchParams({
    houseId: String(houseId),
    viewType,
  })}`;

export interface ListResultProps {
  image: ResultImageMeta;
  isProductView: boolean;
}

interface SectionFallbackProps {
  state: SectionDisplayState;
  loadErrorMessage: string;
  partialMessage: string;
  emptyMessage?: string;
  emptyDescription?: string;
  partialDescription?: string;
  onRetry?: () => void;
  slotClassName: string;
}

const SectionFallback = ({
  state,
  loadErrorMessage,
  partialMessage,
  emptyMessage,
  emptyDescription,
  partialDescription,
  onRetry,
  slotClassName,
}: SectionFallbackProps) => {
  if (state === 'content') return null;

  if (state === 'loading') {
    return (
      <div className={slotClassName}>
        <Loading inline />
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className={slotClassName}>
        <InlineError
          message={loadErrorMessage}
          onRetry={
            onRetry
              ? () => {
                  void onRetry();
                }
              : undefined
          }
        />
      </div>
    );
  }

  const title =
    state === 'partial' ? partialMessage : (emptyMessage ?? partialMessage);
  const description =
    state === 'partial' ? partialDescription : emptyDescription;

  return (
    <div className={slotClassName}>
      <EmptyView title={title} description={description} />
    </div>
  );
};

const ListResult = ({ image, isProductView }: ListResultProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as {
    from?: 'loading' | 'mypage';
    entryGenImgId?: number;
  } | null;
  const isFromLoading = locationState?.from === 'loading';
  const isFromMypage = locationState?.from === 'mypage';
  const entryGenImgId = locationState?.entryGenImgId ?? image.imageId;

  const {
    data: listData,
    isLoading: isSelectedLoading,
    isError: isSelectedError,
    refetch: refetchSelected,
  } = useGenerateListResultQuery(image.imageId);

  const {
    data: similarData,
    isLoading: isSimilarLoading,
    isError: isSimilarError,
    refetch: refetchSimilar,
  } = useSimilarItemsQuery(image.imageId);

  const {
    data: relatedData,
    isLoading: isRelatedLoading,
    isError: isRelatedError,
    refetch: refetchRelated,
  } = useRelatedImagesQuery(image.imageId);

  const selectedProductsRaw = useMemo(
    () => listData?.products ?? [],
    [listData?.products]
  );
  const similarProductsRaw = useMemo(
    () => similarData?.products ?? [],
    [similarData?.products]
  );
  const relatedImagesRaw = useMemo(
    () => relatedData?.images ?? [],
    [relatedData?.images]
  );

  const renderableSelectedProducts = useMemo(
    () => selectedProductsRaw.filter((product) => product.id != null),
    [selectedProductsRaw]
  );

  const selectedProductIdsParam = useMemo(
    () => joinAnalyticsIds(renderableSelectedProducts),
    [renderableSelectedProducts]
  );

  const resultListPageViewParams = useMemo(() => {
    if (isFromMypage) {
      return { image_entry_route: IMAGE_ENTRY_ROUTE.MYPAGE };
    }

    if (isFromLoading) {
      return { image_entry_route: getEntryRoute() };
    }

    return {};
  }, [isFromMypage, isFromLoading]);

  useAnalyticsPageView(
    GA_EVENTS.resultList.PAGE_VIEW,
    SCREEN_NAME.RESULT_LIST,
    {
      gen_img_id: image.imageId,
      selected_product_ids: selectedProductIdsParam,
      ...resultListPageViewParams,
    },
    {
      enabled: !isSelectedLoading,
      refireKey: image.imageId,
    }
  );

  const renderableSimilarProducts = useMemo(
    () => similarProductsRaw.filter((product) => product.id != null),
    [similarProductsRaw]
  );

  const renderableRelatedImages = useMemo(
    () =>
      relatedImagesRaw.filter(
        (relatedImage) =>
          relatedImage.id != null &&
          relatedImage.resultType != null &&
          Boolean(relatedImage.imageUrl?.trim())
      ),
    [relatedImagesRaw]
  );

  const selectedState = getSectionDisplayState({
    isLoading: isSelectedLoading,
    isError: isSelectedError,
    rawCount: selectedProductsRaw.length,
    renderableCount: renderableSelectedProducts.length,
  });

  const similarState = getSectionDisplayState({
    isLoading: isSimilarLoading,
    isError: isSimilarError,
    rawCount: similarProductsRaw.length,
    renderableCount: renderableSimilarProducts.length,
  });

  const relatedState = getSectionDisplayState({
    isLoading: isRelatedLoading,
    isError: isRelatedError,
    rawCount: relatedImagesRaw.length,
    renderableCount: renderableRelatedImages.length,
  });

  const relatedTitle = EMPTY_VIEW_TEXT.listResult.related.otherImagesTitle;

  const {
    wrapReselectClick,
    handleSelectedListCardClick,
    handleSelectedListCardGoSiteClick,
    handleSelectedListCardSaveToggle,
    handleSimilarFeedCardClick,
    handleSimilarFeedCardGoSiteClick,
    handleSimilarFeedCardSaveToggle,
    handleRelatedImageClick,
  } = useResultListAnalytics({
    genImgId: image.imageId,
    entryGenImgId,
    selectedState,
    similarState,
    relatedState,
    renderableSelectedProducts,
    renderableSimilarProducts,
    renderableRelatedImages,
  });

  const { mutate: toggleJjym } = useJjymMutation({
    onSavedAction: () => {
      navigate(ROUTES.MYPAGE, { state: { activeTab: 'savedItems' } });
    },
  });
  const getSavedState = useSavedItemsStore((s) => s.getSavedState);

  const handleReselectProducts = wrapReselectClick(() => {
    const mapped = selectedProductsRaw
      .filter((product) => product.id != null)
      .map(toProductItem);

    if (mapped.length === 0) {
      navigate(ROUTES.HOME, { state: { activeTab: 'product' } });
      return;
    }

    useFunnelStore.getState().reset();
    useImageFlowStore.getState().startFlow({
      route: 'PRODUCT_SELECTION',
      isRegenerate: true,
      productIds: mapped.map((p) => p.id),
      productsToBeRestored: mapped,
    });

    navigate(ROUTES.HOME, { state: { activeTab: 'product' } });
  });

  const showSimilarSection = similarState !== 'empty';
  const showRelatedSection = relatedState !== 'empty';

  return (
    <div className={styles.root}>
      <GeneratedImg image={image} />
      <div className={styles.mainArea}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h1 className={styles.sectionTitle}>선택한 상품</h1>
            {isProductView && (
              <ActionButton
                size="S"
                leftIcon="RefreshStrokeWhite"
                disabled={selectedState === 'loading'}
                onClick={handleReselectProducts}
              >
                다시 선택하기
              </ActionButton>
            )}
          </div>
          <div className={styles.flexContent}>
            <SectionFallback
              state={selectedState}
              loadErrorMessage={EMPTY_VIEW_TEXT.listResult.selected.loadError}
              emptyMessage={EMPTY_VIEW_TEXT.listResult.selected.empty}
              emptyDescription={
                EMPTY_VIEW_TEXT.listResult.selected.emptyDescription
              }
              partialMessage={EMPTY_VIEW_TEXT.listResult.selected.partial}
              partialDescription={
                EMPTY_VIEW_TEXT.listResult.selected.partialDescription
              }
              onRetry={refetchSelected}
              slotClassName={styles.listLoadingSlot}
            />
            {selectedState === 'content'
              ? renderableSelectedProducts.map((item) => {
                  const id = item.id!;
                  const href = item.linkUrl?.trim() ?? '';

                  return (
                    <ListProductCard
                      key={id}
                      cardSize="m"
                      enableWholeCardLink={Boolean(href)}
                      onCardClick={() => handleSelectedListCardClick(item)}
                      product={{
                        title: item.name ?? '',
                        imageUrl: item.imageUrl ?? '',
                        colorHexes: (item.colors ?? [])
                          .map((color) => color.value)
                          .filter((value): value is string => Boolean(value)),
                      }}
                      price={{
                        original: item.originalPrice,
                        discount: item.finalPrice,
                        discountRate: item.discountRate,
                      }}
                      save={{
                        isSaved: getSavedState(id, item.isLiked),
                        onToggle: () => {
                          const isSaved = getSavedState(id, item.isLiked);
                          handleSelectedListCardSaveToggle(item, isSaved);
                          toggleJjym(id, {
                            loginEntryRoute:
                              LOGIN_ENTRY_ROUTE.PRODUCT_LIST_SAVE,
                            productName: item.name,
                          });
                        },
                      }}
                      link={
                        href
                          ? {
                              href,
                              onClick: () =>
                                handleSelectedListCardGoSiteClick(item),
                            }
                          : undefined
                      }
                    />
                  );
                })
              : null}
          </div>
        </div>

        {showSimilarSection ? (
          <div className={styles.section}>
            <h1 className={styles.sectionTitle}>함께 둘러볼 만한 상품</h1>
            <div className={styles.gridContent}>
              <SectionFallback
                state={similarState}
                loadErrorMessage={EMPTY_VIEW_TEXT.listResult.similar.loadError}
                partialMessage={EMPTY_VIEW_TEXT.listResult.similar.partial}
                partialDescription={
                  EMPTY_VIEW_TEXT.listResult.similar.partialDescription
                }
                onRetry={refetchSimilar}
                slotClassName={styles.gridLoadingSlot}
              />
              {similarState === 'content'
                ? renderableSimilarProducts.map((item) => {
                    const id = item.id!;
                    const href = item.linkUrl?.trim() ?? '';

                    return (
                      <ProductCard
                        key={id}
                        enableWholeCardLink={Boolean(href)}
                        onCardClick={() => handleSimilarFeedCardClick(item)}
                        product={{
                          brand: item.brand ?? '',
                          title: item.name ?? '',
                          imageUrl: item.imageUrl ?? '',
                          colorHexes: (item.colors ?? [])
                            .map((color) => color.value)
                            .filter((value): value is string => Boolean(value)),
                        }}
                        price={{
                          original: item.originalPrice,
                          discount: item.finalPrice,
                          discountRate: item.discountRate,
                        }}
                        save={{
                          isSaved: getSavedState(id, item.isLiked),
                          onToggle: () => {
                            const isSaved = getSavedState(id, item.isLiked);
                            handleSimilarFeedCardSaveToggle(item, isSaved);
                            toggleJjym(id, {
                              loginEntryRoute:
                                LOGIN_ENTRY_ROUTE.PRODUCT_CARD_SAVE,
                              productName: item.name,
                            });
                          },
                          count: item.jjymCount,
                        }}
                        link={
                          href
                            ? {
                                href,
                                onClick: () =>
                                  handleSimilarFeedCardGoSiteClick(item),
                              }
                            : undefined
                        }
                      />
                    );
                  })
                : null}
            </div>
          </div>
        ) : null}

        {showRelatedSection ? (
          <div className={styles.section}>
            <h1 className={styles.sectionTitle}>{relatedTitle}</h1>
            <div className={styles.gridContent}>
              <SectionFallback
                state={relatedState}
                loadErrorMessage={EMPTY_VIEW_TEXT.listResult.related.loadError}
                partialMessage={EMPTY_VIEW_TEXT.listResult.related.partial}
                partialDescription={
                  EMPTY_VIEW_TEXT.listResult.related.partialDescription
                }
                onRetry={refetchRelated}
                slotClassName={styles.gridLoadingSlot}
              />
              {relatedState === 'content'
                ? renderableRelatedImages.map((item) => (
                    <StyleCard
                      key={item.id}
                      imageSrc={item.imageUrl!}
                      size="s"
                      onClick={() => {
                        if (item.id == null || item.resultType == null) return;

                        handleRelatedImageClick(item.id);

                        navigate(
                          getGenerateResultPath(item.id, item.resultType),
                          {
                            state: {
                              imageUrl: item.imageUrl,
                              ...(isFromMypage && { from: 'mypage' as const }),
                              entryGenImgId,
                            },
                          }
                        );
                      }}
                    />
                  ))
                : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ListResult;
