import { useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';

import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { useGeneratedCategoriesQuery } from '@pages/generate/apis/queries/useGeneratedCategoriesQuery';
import { getGeneratedImageProducts } from '@pages/generate/apis/queries/useGeneratedProductsQuery';
import FilterChip from '@pages/generate/components/filterChip/FilterChip';
import { shouldShowDetectionPending } from '@pages/generate/constants/curationDetectionMode';
import { useABTest } from '@pages/generate/hooks/useABTest';
import {
  useActiveImageCurationState,
  useActiveImageId,
} from '@pages/generate/hooks/useCurationState';
import { useCurationCacheStore } from '@pages/generate/stores/useCurationCacheStore';
import { useCurationStore } from '@pages/generate/stores/useCurationStore';
import type { FurnitureProductsInfoResponse } from '@pages/generate/types/furniture';
import { logResultImgClickCurationSectionFilter } from '@pages/generate/utils/analytics';
import { useGetJjymListQuery } from '@pages/mypage/apis/queries/useGetJjymListQuery';

import { ROUTES } from '@routes/paths';

import { useSavedItemsStore } from '@store/useSavedItemsStore';

import { queryKeys } from '@constants/queryKey';

import CardProductItem from './CardProductItem';
import { normalizeProductsForCard } from './curationProducts';
import * as styles from './CurationSection.css';

const FILTER_SKELETON_CHIP_COUNT = 4;
const PRODUCT_SKELETON_CARD_COUNT = 4;
const SECTION_SWITCH_EPSILON_PX = 1;
type NormalizedProductsByCategory = Record<
  number,
  ReturnType<typeof normalizeProductsForCard>
>;

interface CurationSectionProps {
  groupId?: number | null;
}

/**
 * 결과 페이지 인라인 큐레이션 섹션
 * - 감지된 가구 카테고리/상품을 고정 영역에 표시
 * - 그룹 기반 진입 시 groupId를 통해 캐시·프리패치 범위를 확정
 */
const CurationSection = ({ groupId = null }: CurationSectionProps) => {
  const activeImageId = useActiveImageId();
  const imageState = useActiveImageCurationState();
  const selectedCategoryId = imageState?.selectedCategoryId ?? null;
  const selectCategory = useCurationStore((state) => state.selectCategory);
  const detectedObjectsCount = imageState?.detectedObjects.length ?? 0;

  const navigate = useNavigate();
  const { variant } = useABTest();

  const handleGotoMypage = () => {
    navigate(ROUTES.MYPAGE);
  };

  const categoriesQuery = useGeneratedCategoriesQuery(
    groupId,
    activeImageId ?? null
  );

  const categories = useMemo(
    () => categoriesQuery.data?.categories ?? [],
    [categoriesQuery.data?.categories]
  );
  const groupProductCache = useCurationCacheStore((state) =>
    groupId !== null ? (state.groups[groupId]?.products ?? null) : null
  );
  const categoryProductQueries = useQueries({
    queries: categories.map((category) => {
      const initialData =
        groupId !== null
          ? groupProductCache?.[category.id]?.response
          : undefined;

      return {
        // eslint-disable-next-line @tanstack/query/exhaustive-deps -- activeImageId는 queryKeys factory 인자에 포함됨
        queryKey:
          groupId !== null
            ? queryKeys.furniture.productsGroup({
                groupId,
                imageId: activeImageId,
                categoryId: category.id,
              })
            : queryKeys.furniture.products({
                groupId,
                imageId: activeImageId,
                categoryId: category.id,
              }),
        queryFn: () => getGeneratedImageProducts(activeImageId!, category.id),
        enabled: activeImageId !== null,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        ...(initialData ? { initialData } : {}),
      };
    }),
  });

  const normalizedProductsByCategory = useMemo(() => {
    return categories.reduce<NormalizedProductsByCategory>(
      (acc, category, index) => {
        const response = categoryProductQueries[index]?.data as
          | FurnitureProductsInfoResponse
          | undefined;
        const products = response?.products ?? [];
        acc[category.id] = normalizeProductsForCard(products);
        return acc;
      },
      {}
    );
  }, [categories, categoryProductQueries]);

  const isInitialProductsLoading = useMemo(
    () =>
      categoryProductQueries.length > 0 &&
      categoryProductQueries.every(
        (query) => query.isLoading && query.data === undefined
      ),
    [categoryProductQueries]
  );

  const contentRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<number, HTMLElement | null>>({});
  const chipRefs = useRef<Record<number, HTMLSpanElement | null>>({});
  const selectedCategoryIdRef = useRef<number | null>(selectedCategoryId);
  const scrollFrameRef = useRef<number | null>(null);

  useEffect(() => {
    selectedCategoryIdRef.current = selectedCategoryId;
  }, [selectedCategoryId]);

  // 서버 찜 목록 불러오기
  const { data: jjymItems = [] } = useGetJjymListQuery();
  const setSavedProductIds = useSavedItemsStore((s) => s.setSavedProductIds);

  useEffect(() => {
    // 추천ID(recommendId) 기준으로 맞춰서 넣기
    const ids = jjymItems.map((item) => item.rawProductId);
    setSavedProductIds(ids);
  }, [jjymItems, setSavedProductIds]);

  // 카테고리 사전 로딩 이후, 각 카테고리별 상품을 백그라운드에서 프리패치
  // - 요구사항: 객체 추론 직후 요청 가능한 값(상품 리스트)을 미리 로딩
  const queryClient = useQueryClient();
  const prefetchedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!activeImageId) return;
    if (!categories || categories.length === 0) return;

    // 카테고리별 프리패치를 병렬로 처리해 초기 반응 속도 확보
    categories.forEach((category) => {
      const dedupeKey = `${groupId ?? activeImageId}:${category.id}`;
      if (prefetchedRef.current.has(dedupeKey)) return;
      if (
        groupId !== null &&
        groupProductCache &&
        groupProductCache[category.id]
      ) {
        prefetchedRef.current.add(dedupeKey);
        return;
      }
      // 프리패치용 쿼리키를 그룹/이미지/카테고리 세트로 구성
      const productQueryVars = {
        groupId,
        imageId: activeImageId,
        categoryId: category.id,
      };
      const productQueryKey =
        groupId !== null
          ? queryKeys.furniture.productsGroup(productQueryVars)
          : queryKeys.furniture.products(productQueryVars);
      const cachedQuery =
        queryClient.getQueryData<FurnitureProductsInfoResponse>(
          productQueryKey
        );
      if (cachedQuery) {
        prefetchedRef.current.add(dedupeKey);
        return;
      }
      prefetchedRef.current.add(dedupeKey);
      void queryClient.prefetchQuery({
        queryKey: productQueryKey,
        queryFn: () => {
          return getGeneratedImageProducts(
            productQueryVars.imageId,
            productQueryVars.categoryId
          );
        },
        staleTime: 5 * 60 * 1000,
      });
    });
  }, [queryClient, activeImageId, categories, groupId, groupProductCache]);

  useEffect(() => {
    const activeCategoryId = selectedCategoryId;
    if (activeCategoryId === null) return;

    chipRefs.current[activeCategoryId]?.scrollIntoView({
      block: 'nearest',
      inline: 'center',
    });
  }, [selectedCategoryId]);

  const syncSelectedCategoryByScroll = useCallback(() => {
    if (activeImageId === null) return;
    if (categories.length === 0) return;
    const scrollContainer = contentRef.current;
    if (!scrollContainer) return;

    const currentScrollTop = scrollContainer.scrollTop;
    const anchorThreshold = currentScrollTop + SECTION_SWITCH_EPSILON_PX;
    const containerTop = scrollContainer.getBoundingClientRect().top;
    let nextCategoryId: number | null = categories[0]?.id ?? null;

    categories.forEach((category) => {
      const section = sectionRefs.current[category.id];
      if (!section) return;
      const sectionTopFromScrollStart =
        section.getBoundingClientRect().top - containerTop + currentScrollTop;
      if (sectionTopFromScrollStart <= anchorThreshold) {
        nextCategoryId = category.id;
      }
    });

    if (nextCategoryId === null) return;
    if (selectedCategoryIdRef.current === nextCategoryId) return;
    selectCategory(activeImageId, nextCategoryId);
  }, [activeImageId, categories, selectCategory]);

  useEffect(() => {
    if (activeImageId === null) return;
    if (categories.length === 0) return;
    const scrollContainer = contentRef.current;
    if (!scrollContainer) return;

    syncSelectedCategoryByScroll();

    const handleScroll = () => {
      if (scrollFrameRef.current !== null) return;
      scrollFrameRef.current = window.requestAnimationFrame(() => {
        scrollFrameRef.current = null;
        syncSelectedCategoryByScroll();
      });
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = null;
      }
    };
  }, [activeImageId, categories, syncSelectedCategoryByScroll]);

  const scrollToCategorySection = useCallback(
    (categoryId: number, behavior: ScrollBehavior = 'smooth') => {
      const scrollContainer = contentRef.current;
      const section = sectionRefs.current[categoryId];
      if (!scrollContainer || !section) return;

      const containerTop = scrollContainer.getBoundingClientRect().top;
      const sectionTopFromScrollStart =
        section.getBoundingClientRect().top -
        containerTop +
        scrollContainer.scrollTop;
      const targetTop = Math.max(sectionTopFromScrollStart, 0);
      scrollContainer.scrollTo({
        top: targetTop,
        behavior,
      });
    },
    []
  );

  /**
   * 카테고리 선택
   */
  const handleCategorySelect = (categoryId: number) => {
    if (activeImageId === null) return;
    if (selectedCategoryId !== categoryId) {
      logResultImgClickCurationSectionFilter(variant);
      selectCategory(activeImageId, categoryId);
    }
    scrollToCategorySection(categoryId);
  };

  // const LoadingDots = () => (
  //   <span className={styles.loadingDots}>
  //     <span className={styles.dot} />
  //     <span className={styles.dot} />
  //     <span className={styles.dot} />
  //   </span>
  // );

  /**
   * 상태 메시지 렌더러
   */
  const renderStatus = (
    message: string,
    description?: string,
    action?: { label: string; onClick: () => void },
    isLoading?: boolean
  ) => (
    <div className={styles.statusContainer}>
      <p
        className={
          isLoading ? styles.statusMessageShimmer : styles.statusMessage
        }
      >
        {message}
        {/* {isLoading && <LoadingDots />} */}
      </p>
      {description && <p className={styles.statusSubMessage}>{description}</p>}
      {action && (
        <button
          type="button"
          className={styles.statusButton}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  );

  const renderCategoryStatus = (
    message: string,
    action?: { label: string; onClick: () => void },
    isLoading?: boolean
  ) => (
    <div className={styles.sectionStatusContainer}>
      <p
        className={
          isLoading ? styles.statusMessageShimmer : styles.statusMessage
        }
      >
        {message}
      </p>
      {action && (
        <button
          type="button"
          className={styles.statusButton}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  );

  const renderProductSkeletonGrid = (keyPrefix: string) => (
    <div className={styles.gridbox}>
      {Array.from({ length: PRODUCT_SKELETON_CARD_COUNT }, (_, index) => (
        <div
          key={`${keyPrefix}-${index}`}
          className={styles.productSkeletonCard}
          aria-hidden
        >
          <div className={styles.productSkeletonImage} />
          <div className={styles.productSkeletonInfo}>
            <div className={styles.productSkeletonBrand} />
            <div className={styles.productSkeletonName} />
            <div className={styles.productSkeletonPriceGroup}>
              <div className={styles.productSkeletonOldPrice} />
              <div className={styles.productSkeletonCurrentPrice} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  /**
   * 카테고리/상품 로딩 상태에 따라 섹션을 분기 렌더링
   */
  const renderProductSection = () => {
    if (activeImageId === null) {
      return renderStatus(
        '가구 추천을 보려면 생성된 이미지를 먼저 선택해 주세요',
        '상단 가구 필터에서 원하는 가구를 선택해 주세요'
      );
    }
    if (
      shouldShowDetectionPending(detectedObjectsCount) ||
      categoriesQuery.isLoading
    ) {
      return renderProductSkeletonGrid('detecting');
    }
    if (categoriesQuery.isError) {
      return renderStatus(
        '가구 카테고리를 불러오지 못했어요',
        '네트워크 상태를 확인한 뒤 다시 시도해 주세요',
        { label: '다시 불러오기', onClick: () => categoriesQuery.refetch() }
      );
    }
    if (categories.length === 0) {
      return renderStatus(
        '감지된 가구가 없어 추천을 제공할 수 없어요',
        '다른 이미지를 선택하거나 새로 생성해 보세요'
      );
    }
    if (isInitialProductsLoading) {
      return renderProductSkeletonGrid('initial-products');
    }

    return (
      <div className={styles.sectionList}>
        {categories.map((category, index) => {
          const categoryQuery = categoryProductQueries[index];
          const normalizedProducts =
            normalizedProductsByCategory[category.id] ?? [];

          let sectionContent: ReactNode = renderProductSkeletonGrid(
            `category-${category.id}`
          );

          if (categoryQuery) {
            if (categoryQuery.isError) {
              sectionContent = renderCategoryStatus(
                `${category.categoryName} 상품을 불러오지 못했어요`,
                {
                  label: '다시 불러오기',
                  onClick: () => categoryQuery.refetch(),
                }
              );
            } else if (!categoryQuery.isLoading) {
              sectionContent =
                normalizedProducts.length === 0 ? (
                  renderCategoryStatus(
                    `${category.categoryName} 카테고리 상품이 없어요`
                  )
                ) : (
                  <div className={styles.gridbox}>
                    {normalizedProducts.map((product) => (
                      <CardProductItem
                        key={`${category.id}-${product.id ?? product.furnitureProductId}`}
                        product={product}
                        onGotoMypage={handleGotoMypage}
                      />
                    ))}
                  </div>
                );
            }
          }

          return (
            <section
              key={category.id}
              ref={(element) => {
                sectionRefs.current[category.id] = element;
              }}
              className={styles.categorySection}
              data-category-id={category.id}
            >
              {sectionContent}
            </section>
          );
        })}
      </div>
    );
  };

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>이 공간의 가구 큐레이션</h2>

      {!categoriesQuery.isError && (
        <div className={styles.filterSection}>
          {categories.length === 0
            ? Array.from({ length: FILTER_SKELETON_CHIP_COUNT }, (_, index) => (
                <span
                  key={`filter-skeleton-${index}`}
                  className={styles.filterSkeletonChip}
                  aria-hidden
                />
              ))
            : categories.map((category) => (
                <span
                  key={category.id}
                  ref={(element) => {
                    chipRefs.current[category.id] = element;
                  }}
                  className={styles.filterChipAnchor}
                >
                  <FilterChip
                    isSelected={selectedCategoryId === category.id}
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    {category.categoryName}
                  </FilterChip>
                </span>
              ))}
        </div>
      )}

      <div className={styles.content} ref={contentRef}>
        {renderProductSection()}
      </div>
    </section>
  );
};

export default CurationSection;
