import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useProductListQuery } from '@pages/home/apis/queries/useProductListQuery';

import type { CurationProductResponse } from '@apis/__generated__/data-contracts';

import type { ProductListQueryVariables } from '@constants/queryKey';

/**
 * 상품 검색 카드 렌더에 사용하는 뷰 모델 타입
 * - SearchSection ProductCard 입력 형태를 기준으로 정의한다.
 */
interface ProductSearchCardItem {
  id: number;
  title: string;
  brand: string;
  categoryName?: string;
  imageUrl: string;
  discountRate: number;
  originalPrice: number;
  discountPrice: number;
  colorHexes: string[];
  saveCount: number;
  linkUrl: string;
}

/**
 * API 상품 응답 배열을 카드 렌더 모델로 정규화
 */
const toProductSearchCardItems = (
  products: CurationProductResponse[]
): ProductSearchCardItem[] =>
  products
    .filter((product) => product.id != null)
    .map((product) => ({
      id: product.id!,
      title: product.name ?? '',
      brand: product.brand ?? '',
      categoryName: product.categoryName,
      imageUrl: product.imageUrl ?? '',
      discountRate: product.discountRate ?? 0,
      originalPrice: product.originalPrice ?? 0,
      discountPrice: product.finalPrice ?? 0,
      colorHexes: [],
      saveCount: 0,
      linkUrl: product.linkUrl ?? '',
    }));

/**
 * 상품 검색 섹션 상태·무한 스크롤·목록 뷰 모델
 * - 키워드 + 디바운스, `useProductListQuery` 파라미터 조합, sentinel, 카드용 변환
 */
const useProductSearch = (baseParams: ProductListQueryVariables) => {
  /** 하단 sentinel(ref)과 검색어 상태 */
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');

  /** 입력 직후 과요청을 줄이기 위한 300ms 디바운스 */
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [keyword]);

  /** 필터 기본 파라미터 + 키워드 결합 */
  const queryParams = useMemo(() => {
    const trimmedKeyword = debouncedKeyword.trim();
    return {
      ...baseParams,
      keyword: trimmedKeyword || undefined,
    };
  }, [baseParams, debouncedKeyword]);

  /** 커서 기반 상품 목록 조회 */
  const {
    data: productPages,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isPending,
    isError,
    refetch,
  } = useProductListQuery(queryParams);

  const isRecommended = productPages?.pages[0]?.meta?.isRecommended ?? false;

  /**
   * sentinel 진입 시 다음 페이지 요청
   * - hasNextPage=false이거나 이미 로딩 중이면 요청하지 않음
   * - 추천 목록(isRecommended) 응답에서는 추가 페이지를 요청하지 않음
   */
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage || isFetchingNextPage || isRecommended) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        void fetchNextPage();
      },
      { root: null, threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isRecommended]);

  /** 페이지 응답을 상품 카드 렌더링 형태로 변환 */
  const { products, recommendedProducts } = useMemo(() => {
    const flatProducts = (productPages?.pages ?? []).flatMap(
      (page) => page.products ?? []
    );
    const cardItems = toProductSearchCardItems(flatProducts);

    if (isRecommended) {
      return { products: [], recommendedProducts: cardItems };
    }

    return { products: cardItems, recommendedProducts: [] };
  }, [isRecommended, productPages?.pages]);

  const showEmptyState = !isPending && !isError && products.length === 0;

  /** SearchBar controlled onChange 핸들러 */
  const handleSearchKeywordChange = useCallback((value: string) => {
    setKeyword(value);
  }, []);

  /** SearchSection에서 사용할 값 */
  return {
    loadMoreRef,
    keyword,
    debouncedKeyword,
    products,
    recommendedProducts,
    isRecommended,
    showEmptyState,
    isPending,
    isFetching,
    isError,
    refetch,
    handleSearchKeywordChange,
  };
};

export { useProductSearch };
export type { ProductSearchCardItem };
