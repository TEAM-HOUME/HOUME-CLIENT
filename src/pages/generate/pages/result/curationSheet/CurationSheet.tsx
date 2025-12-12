import { useEffect, useMemo, useRef } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

import FilterChip from '@/pages/generate/components/filterChip/FilterChip';
import { useABTest } from '@/pages/generate/hooks/useABTest';
import {
  useActiveImageCurationState,
  useActiveImageId,
  useGeneratedCategoriesQuery,
  useGeneratedProductsQuery,
  useSheetSnapState,
} from '@/pages/generate/hooks/useFurnitureCuration';
import { useCurationCacheStore } from '@/pages/generate/stores/useCurationCacheStore';
import { useCurationStore } from '@/pages/generate/stores/useCurationStore';
import { logResultImgClickCurationSheetFilter } from '@/pages/generate/utils/analytics';
import { useGetJjymListQuery } from '@/pages/mypage/hooks/useSaveItemList';
import { ROUTES } from '@/routes/paths';
import { QUERY_KEY } from '@/shared/constants/queryKey';
import { useSavedItemsStore } from '@/store/useSavedItemsStore';
import { useUserStore } from '@/store/useUserStore';

import { getGeneratedImageProducts } from '@pages/generate/apis/furniture';
import {
  buildDetectedCodeToCategoryId,
  pickHotspotIdByCategory,
} from '@pages/generate/utils/hotspotCategoryResolver';

import CardProductItem from './CardProductItem';
import * as styles from './CurationSheet.css';
import { CurationSheetWrapper } from './CurationSheetWrapper';

import type { FurnitureProductsInfoResponse } from '@pages/generate/types/furniture';

// 카테고리 스켈레톤 칩 길이 프리셋 중 세 번째(long)만 사용
const FILTER_SKELETON_WIDTH = 'long' as const;
// 프리패치 쿼리키 튜플 정의
type ProductPrefetchQueryKey = [
  string,
  {
    groupId: number | null;
    imageId: number;
    categoryId: number;
  },
];

interface CurationSheetProps {
  groupId?: number | null;
}

/**
 * 결과 페이지 하단 큐레이션 시트
 * - 감지된 가구 카테고리/상품을 표시하고 바텀시트 스냅 상태와 연동
 * - 그룹 기반 진입 시 groupId를 통해 캐시·프리패치 범위를 확정
 */
export const CurationSheet = ({ groupId = null }: CurationSheetProps) => {
  // 전역상태 사용
  const displayName = useUserStore((state) => state.userName ?? '사용자');
  const activeImageId = useActiveImageId();
  const imageState = useActiveImageCurationState();
  const selectedCategoryId = imageState?.selectedCategoryId ?? null;
  const selectCategory = useCurationStore((state) => state.selectCategory);
  const selectHotspot = useCurationStore((state) => state.selectHotspot);
  const hotspots = useMemo(
    () => imageState?.hotspots ?? [],
    [imageState?.hotspots]
  );
  const detectedObjects = useMemo(
    () => imageState?.detectedObjects ?? [],
    [imageState?.detectedObjects]
  );
  const { snapState, setSnapState } = useSheetSnapState();

  const navigate = useNavigate();
  const { variant } = useABTest();

  const handleGotoMypage = () => {
    navigate(ROUTES.MYPAGE);
  };

  const categoriesQuery = useGeneratedCategoriesQuery(
    groupId,
    activeImageId ?? null
  );
  const productsQuery = useGeneratedProductsQuery(
    groupId,
    activeImageId ?? null,
    selectedCategoryId
  );

  const categories = useMemo(
    () => categoriesQuery.data?.categories ?? [],
    [categoriesQuery.data?.categories]
  );
  const groupProductCache = useCurationCacheStore((state) =>
    groupId !== null ? (state.groups[groupId]?.products ?? null) : null
  );
  const productsData = productsQuery.data?.products;
  const headerName = productsQuery.data?.userName ?? displayName;
  const detectedCodeToCategoryId = useMemo(
    () => buildDetectedCodeToCategoryId(categories, detectedObjects),
    [categories, detectedObjects]
  );

  const normalizedProducts = useMemo(() => {
    return (productsData ?? []).map((product, index) => {
      const byRecommend = product.id;
      const recommendId =
        typeof byRecommend === 'number' && Number.isFinite(byRecommend)
          ? byRecommend
          : undefined;
      const byProductId = Number(product.furnitureProductId);
      const safeProductId = Number.isFinite(byProductId)
        ? byProductId
        : index + 1;

      return {
        id: recommendId,
        isRecommendId: Boolean(recommendId),
        furnitureProductId: safeProductId,
        furnitureProductName: product.furnitureProductName,
        furnitureProductMallName: product.furnitureProductMallName,
        furnitureProductImageUrl:
          product.furnitureProductImageUrl || product.baseFurnitureImageUrl,
        furnitureProductSiteUrl: product.furnitureProductSiteUrl,
      };
    });
  }, [productsData]);

  // 서버 찜 목록 불러오기
  const { data: jjymItems = [] } = useGetJjymListQuery();
  const setSavedProductIds = useSavedItemsStore((s) => s.setSavedProductIds);

  useEffect(() => {
    // 추천ID(recommendId) 기준으로 맞춰서 넣기
    const ids = jjymItems.map((item) => item.id);
    setSavedProductIds(ids);
  }, [jjymItems, setSavedProductIds]);

  useEffect(() => {
    if (
      activeImageId === null &&
      snapState !== 'collapsed' &&
      snapState !== 'hidden'
    ) {
      setSnapState('collapsed');
    }
  }, [activeImageId, snapState, setSnapState]);

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
      const productQueryKey: ProductPrefetchQueryKey = [
        groupId !== null
          ? QUERY_KEY.GENERATE_FURNITURE_PRODUCTS_GROUP
          : QUERY_KEY.GENERATE_FURNITURE_PRODUCTS,
        {
          groupId,
          imageId: activeImageId,
          categoryId: category.id,
        },
      ];
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
        queryFn: ({ queryKey }) => {
          const [, variables] = queryKey as ProductPrefetchQueryKey;
          return getGeneratedImageProducts(
            variables.imageId,
            variables.categoryId
          );
        },
        staleTime: 30 * 1000,
      });
    });
  }, [queryClient, activeImageId, categories, groupId, groupProductCache]);

  /**
   * 카테고리 선택 시 핫스팟 동기화 및 시트 펼침
   */
  const handleCategorySelect = (categoryId: number) => {
    if (activeImageId === null) return;
    if (selectedCategoryId === categoryId) return;
    logResultImgClickCurationSheetFilter(variant);
    selectCategory(activeImageId, categoryId);
    const hotspotId =
      pickHotspotIdByCategory(
        categoryId,
        hotspots,
        categories,
        detectedCodeToCategoryId
      ) ?? null;
    selectHotspot(activeImageId, hotspotId);
    if (snapState === 'collapsed') {
      setSnapState('mid');
    }
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

  /**
   * 카테고리/상품 로딩 상태에 따라 섹션을 분기 렌더링
   */
  const renderProductSection = () => {
    if (activeImageId === null) {
      return renderStatus(
        '가구 추천을 보려면 생성된 이미지를 먼저 선택해 주세요',
        '결과 이미지에서 핫스팟을 선택하면 추천이 표시돼요'
      );
    }
    if (categoriesQuery.isLoading) {
      return renderStatus(
        '감지된 가구를 분석 중이에요',
        '잠시만 기다려 주세요',
        undefined,
        true
      );
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
        '다른 이미지를 생성하거나 핫스팟을 다시 선택해 주세요'
      );
    }
    if (!selectedCategoryId) {
      return renderStatus(
        '추천받을 가구 카테고리를 선택해 주세요',
        '상단 필터에서 원하는 가구를 골라 주세요'
      );
    }
    if (productsQuery.isLoading) {
      return renderStatus(
        '선택한 가구에 맞는 상품을 찾는 중이에요',
        '곧 추천을 보여드릴게요',
        undefined,
        true
      );
    }
    if (productsQuery.isError) {
      return renderStatus(
        '추천 상품을 불러오지 못했어요',
        '잠시 후 다시 시도해 주세요',
        { label: '다시 불러오기', onClick: () => productsQuery.refetch() }
      );
    }
    if (normalizedProducts.length === 0) {
      return renderStatus(
        '선택한 카테고리에 맞는 상품이 없어요',
        '다른 카테고리를 선택해 보세요'
      );
    }
    return (
      <div className={styles.gridbox}>
        {normalizedProducts.map((product) => (
          <CardProductItem
            key={product.furnitureProductId}
            product={product}
            onGotoMypage={handleGotoMypage}
          />
        ))}
      </div>
    );
  };

  return (
    <CurationSheetWrapper
      snapState={snapState}
      onSnapStateChange={setSnapState}
      onCollapsed={() => {
        if (activeImageId === null) return;
        // 시트 완전히 닫힌 뒤에만 선택 상태 해제해 목록이 사라지는 시점을 늦춤
        selectCategory(activeImageId, null);
        selectHotspot(activeImageId, null);
      }}
    >
      {(snapState) => (
        <>
          <div className={styles.filterSection}>
            {categories.length === 0 ? (
              // 추론 중에는 세 번째 길이(long) 스켈레톤 칩 하나만 노출
              <span
                className={clsx(
                  styles.filterSkeletonChip,
                  styles.filterSkeletonChipWidth[FILTER_SKELETON_WIDTH]
                )}
                aria-hidden
              />
            ) : (
              categories.map((category) => (
                <FilterChip
                  key={category.id}
                  // 접힘 상태에서는 칩을 항상 비선택(회색)으로 표시
                  isSelected={
                    (snapState === 'expanded' || snapState === 'mid') &&
                    selectedCategoryId === category.id
                  }
                  onClick={() => handleCategorySelect(category.id)}
                >
                  {category.categoryName}
                </FilterChip>
              ))
            )}
          </div>
          <div
            className={clsx(
              styles.scrollContentBase,
              styles.scrollContentArea[
                snapState === 'expanded' ? 'expanded' : 'mid'
              ]
            )}
          >
            <p className={styles.headerText}>
              {headerName}님의 취향에 딱 맞는 가구 추천
            </p>
            {/* 그리드 영역 */}
            <div className={styles.curationSection}>
              {renderProductSection()}
            </div>
          </div>
        </>
      )}
    </CurationSheetWrapper>
  );
};
