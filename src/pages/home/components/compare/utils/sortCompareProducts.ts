import type { PriceInfo } from '@shared/types/productCard';

export const COMPARE_SORT_OPTIONS = [
  '낮은 가격순',
  '높은 가격순',
  '추천순',
] as const;

export type CompareSortOption = (typeof COMPARE_SORT_OPTIONS)[number];

export const DEFAULT_COMPARE_SORT_OPTION: CompareSortOption = '추천순';

interface SortableCompareProduct {
  price?: PriceInfo;
}

const getSortPrice = ({ price }: SortableCompareProduct) => {
  const value = price?.discount ?? price?.original;

  return typeof value === 'number' && Number.isFinite(value) ? value : null;
};

export const sortCompareProducts = <T extends SortableCompareProduct>(
  products: readonly T[],
  sortOption: CompareSortOption
) => {
  // 추천순(서버 제공 순서 유지)
  if (sortOption === DEFAULT_COMPARE_SORT_OPTION) return [...products];

  // 낮은 가격순(1), 높은 가격순(-1)
  const direction = sortOption === '낮은 가격순' ? 1 : -1;

  return [...products].sort((a, b) => {
    const aPrice = getSortPrice(a);
    const bPrice = getSortPrice(b);

    if (aPrice === null) return bPrice === null ? 0 : 1;
    if (bPrice === null) return -1;

    return (aPrice - bPrice) * direction;
  });
};
