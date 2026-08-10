import { useEffect, useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useResultRecAnalytics } from '@pages/generate/analytics/useResultRecAnalytics';
import { useCurationCategoriesQuery } from '@pages/generate/apis/queries/useCurationCategoriesQuery';
import { useCurationProductsQuery } from '@pages/generate/apis/queries/useCurationProductsQuery';

import { ROUTES } from '@routes/paths';

import { useSavedItemsStore } from '@store/useSavedItemsStore';

import { LOGIN_ENTRY_ROUTE } from '@shared/analytics/params/gate';
import { EMPTY_VIEW_TEXT } from '@shared/constants/emptyViewText';

import { useJjymMutation } from '@apis/mutations/useJjymMutation';

import Chip from '@components/chip/Chip';
import EmptyView from '@components/emptyView/EmptyView';
import InlineError from '@components/inlineError/InlineError';
import Loading from '@components/loading/Loading';
import ProductCard from '@components/productCard/ProductCard';

import * as styles from './CurationResult.css';
import ImgFeedback from './feedbackSection/ImgFeedback';
import GeneratedImg from './imgSection/GeneratedImg';

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

export interface CurationResultProps {
  images: ResultImageMeta[];
  onCurrentImgIdChange?: (imageId: number) => void;
  groupId?: number | null;
}

interface ProductListFallbackProps {
  state: SectionDisplayState;
  onRetry?: () => void;
}

const ProductListFallback = ({ state, onRetry }: ProductListFallbackProps) => {
  if (state === 'content') return null;

  if (state === 'loading') {
    return (
      <div className={styles.productListFallbackSlot}>
        <Loading inline />
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className={styles.productListFallbackSlot}>
        <InlineError
          message={EMPTY_VIEW_TEXT.curationResult.products.loadError}
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
    state === 'partial'
      ? EMPTY_VIEW_TEXT.curationResult.products.partial
      : EMPTY_VIEW_TEXT.curationResult.products.empty;
  const description =
    state === 'partial'
      ? EMPTY_VIEW_TEXT.curationResult.products.partialDescription
      : state === 'empty'
        ? EMPTY_VIEW_TEXT.curationResult.products.emptyDescription
        : undefined;

  return (
    <div className={styles.productListFallbackSlot}>
      <EmptyView title={title} description={description} />
    </div>
  );
};

const CurationResult = ({
  images,
  onCurrentImgIdChange,
}: CurationResultProps) => {
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );

  const isLockedSlide = images.length > 0 && slideIndex === images.length;
  const lastImageId = images[images.length - 1]?.imageId;
  const currentImageId = images[0]?.imageId ?? 0;

  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useCurationCategoriesQuery(currentImageId);

  useEffect(() => {
    setSelectedCategoryId(null);
  }, [currentImageId]);

  useEffect(() => {
    if (selectedCategoryId !== null) return;
    const list = categoriesData?.categories ?? [];
    const first = list.find((category) => category.id !== undefined);
    if (first?.id !== undefined) setSelectedCategoryId(first.id);
  }, [categoriesData?.categories, selectedCategoryId]);

  const {
    data: productsData,
    isLoading: isProductsLoading,
    isError: isProductsError,
    refetch: refetchProducts,
  } = useCurationProductsQuery(currentImageId, selectedCategoryId ?? 0);

  const productsRaw = productsData?.products;
  const categories = categoriesData?.categories;
  const renderableCategories = useMemo(
    () => (categories ?? []).filter((category) => category.id !== undefined),
    [categories]
  );

  const renderableProducts = useMemo(
    () => (productsRaw ?? []).filter((wrapper) => wrapper.product?.id != null),
    [productsRaw]
  );

  const categoriesState = getSectionDisplayState({
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    rawCount: categories?.length ?? 0,
    renderableCount: renderableCategories.length,
  });

  const productsState =
    selectedCategoryId === null
      ? 'content'
      : getSectionDisplayState({
          isLoading: isProductsLoading,
          isError: isProductsError,
          rawCount: productsRaw?.length ?? 0,
          renderableCount: renderableProducts.length,
        });

  const {
    handleCategoryChipClick,
    handleFeedCardClick,
    handleFeedCardGoSiteClick,
    handleFeedCardSaveToggle,
    handleArrowLeftClick,
    handleArrowRightClick,
    handleMoreImgClick,
    handlePreferenceClick,
    handleFactorFeedbackThankYou,
  } = useResultRecAnalytics({
    currentImageId,
    categoriesState,
    productsState,
    selectedCategoryId,
    renderableCategories,
    renderableProducts,
  });

  const { mutate: toggleJjym } = useJjymMutation({
    loginEntryRoute: LOGIN_ENTRY_ROUTE.PRODUCT_CARD_SAVE,
    onSavedAction: () => {
      navigate(ROUTES.MYPAGE, { state: { activeTab: 'savedItems' } });
    },
  });
  const getSavedState = useSavedItemsStore((s) => s.getSavedState);

  return (
    <div className={styles.root}>
      <GeneratedImg
        images={images}
        onCurrentImgIdChange={onCurrentImgIdChange}
        onSlideChange={setSlideIndex}
        onArrowLeftClick={handleArrowLeftClick}
        onArrowRightClick={handleArrowRightClick}
        onMoreImgClick={handleMoreImgClick}
      />

      <div className={styles.mainArea}>
        {!isLockedSlide && (
          <div className={styles.section}>
            <h1 className={styles.title}>이 공간에 어울리는 추천 상품</h1>
            <div className={styles.chipList}>
              {categoriesState === 'loading' ? (
                <div className={styles.categoryLoadingSlot}>
                  <Loading inline />
                </div>
              ) : null}
              {categoriesState === 'error' ? (
                <div className={styles.blockSlot}>
                  <InlineError
                    message={
                      EMPTY_VIEW_TEXT.curationResult.categories.loadError
                    }
                    onRetry={() => {
                      void refetchCategories();
                    }}
                  />
                </div>
              ) : null}
              {categoriesState === 'empty' || categoriesState === 'partial' ? (
                <div className={styles.blockSlot}>
                  <InlineError
                    message={EMPTY_VIEW_TEXT.curationResult.categories.empty}
                    onRetry={() => {
                      void refetchCategories();
                    }}
                  />
                </div>
              ) : null}
              {categoriesState === 'content'
                ? renderableCategories.map((category) => (
                    <Chip
                      key={category.id}
                      selected={selectedCategoryId === category.id}
                      onClick={() => {
                        const categoryId = category.id!;
                        handleCategoryChipClick(categoryId);
                        setSelectedCategoryId(categoryId);
                      }}
                    >
                      {category.categoryName ?? ''}
                    </Chip>
                  ))
                : null}
            </div>
            <div className={styles.productList}>
              {selectedCategoryId !== null ? (
                <ProductListFallback
                  state={productsState}
                  onRetry={refetchProducts}
                />
              ) : null}
              {selectedCategoryId !== null && productsState === 'content'
                ? renderableProducts.map((wrapper) => {
                    const p = wrapper.product!;
                    const id = p.id!;
                    const href = p.linkUrl?.trim() ?? '';

                    return (
                      <ProductCard
                        key={id}
                        enableWholeCardLink={Boolean(href)}
                        onCardClick={() => handleFeedCardClick(p)}
                        product={{
                          brand: p.brand ?? p.mallName ?? '',
                          title: p.name ?? '',
                          imageUrl: p.imageUrl ?? '',
                          colorHexes: (p.colors ?? [])
                            .map((color) => color.value)
                            .filter((value): value is string => Boolean(value)),
                        }}
                        price={{
                          original: p.originalPrice,
                          discount: p.finalPrice,
                          discountRate: p.discountRate,
                        }}
                        save={{
                          isSaved: getSavedState(id, p.isLiked),
                          onToggle: () => {
                            const isSaved = getSavedState(id, p.isLiked);
                            handleFeedCardSaveToggle(p, isSaved);
                            toggleJjym(id, {
                              loginEntryRoute:
                                LOGIN_ENTRY_ROUTE.PRODUCT_LIST_SAVE,
                              productName: p.name,
                            });
                          },
                        }}
                        link={
                          href
                            ? {
                                href,
                                onClick: () => handleFeedCardGoSiteClick(p),
                              }
                            : undefined
                        }
                      />
                    );
                  })
                : null}
            </div>
          </div>
        )}
        {isLockedSlide && lastImageId !== undefined && (
          <section
            className={styles.section}
            aria-label="생성 이미지 선호도 조사"
          >
            <ImgFeedback
              imageId={lastImageId}
              onPreferenceClick={handlePreferenceClick}
              onFactorFeedbackThankYou={handleFactorFeedbackThankYou}
            />
          </section>
        )}
      </div>
    </div>
  );
};

export default CurationResult;
