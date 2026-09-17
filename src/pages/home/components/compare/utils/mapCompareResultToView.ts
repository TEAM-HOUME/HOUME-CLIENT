import { getCompareSourceLabel } from '@pages/home/constants/compareSourceLabel';

import type {
  LinkInfo,
  PriceInfo,
  ProductInfo,
  SaveInfo,
} from '@shared/types/productCard';

import type {
  JobResultResponse,
  OriginalProductResponse,
  PresetDetailResponse,
} from '@apis/__generated__/data-contracts';

const NOOP_SAVE: SaveInfo = {
  isSaved: false,
  onToggle: () => undefined,
};

export interface CompareResultViewProduct {
  id: number;
  product: ProductInfo;
  price: PriceInfo;
  save: SaveInfo;
  link: LinkInfo;
  benefitAmount: number;
}

/** 결과 화면 맨 위 "검색한 상품" 카드가 그리는 형태. 로딩 중에도 이 값만 있으면 먼저 그린다 */
export interface CompareSearchedProductView {
  product: ProductInfo;
  price?: PriceInfo;
}

export interface CompareResultViewModel {
  searchedProduct: CompareSearchedProductView;
  similarProducts: CompareResultViewProduct[];
  productCount: number;
}

/** job과 프리셋의 원본 상품 필드명이 달라(imageUrl vs thumbnailUrl) 공통 형태로 받는다 */
interface SearchedProductSource {
  title?: string;
  brand?: string;
  imageUrl?: string;
  price?: number;
}

export const toSearchedProductView = ({
  title,
  brand,
  imageUrl,
  price,
}: SearchedProductSource): CompareSearchedProductView => ({
  product: {
    brand,
    title: title ?? '',
    imageUrl,
  },
  price: price != null ? { original: price } : undefined,
});

/** 유사 상품 한 건 → ProductCard 형태. job·프리셋 공통 */
interface SimilarProductSource {
  title?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  productUrl?: string;
  /** 판매처명. 프리셋은 siteName, job은 source를 라벨로 바꿔 넘긴다 */
  siteLabel?: string;
}

interface OriginalPriceSource {
  price?: number;
  currency?: string;
}

const toSimilarProductView = (
  item: SimilarProductSource,
  index: number,
  original: OriginalPriceSource
): CompareResultViewProduct => {
  // TODO: PriceInfo/ProductCard가 통화를 안 받아 KRW가 아닌 금액(eBay는 USD)도 원화처럼 표시된다.
  // 환율 변환 없이 다른 통화끼리 빼면 절감액이 틀리므로, 통화가 같을 때만 계산한다.
  const benefitAmount =
    original.price != null &&
    item.price != null &&
    original.currency != null &&
    original.currency === item.currency
      ? Math.max(0, original.price - item.price)
      : 0;

  return {
    id: index + 1,
    product: {
      brand: item.siteLabel,
      title: item.title ?? '',
      imageUrl: item.imageUrl,
    },
    price: {
      original: item.price,
    },
    save: NOOP_SAVE,
    link: {
      href: item.productUrl,
      label: item.siteLabel,
    },
    benefitAmount,
  };
};

/**
 * 프리셋 비교 결과 → CompareResult UI가 그리는 형태.
 * 화면이 쓰는 필드만 맞춘다. 생성 타입은 전 필드가 optional이라 여기서 기본값을 채운다.
 */
export const mapComparePresetToView = (
  preset: PresetDetailResponse
): CompareResultViewModel => {
  const { originalProduct, totalCount } = preset;
  const similarProducts = preset.similarProducts ?? [];

  return {
    searchedProduct: toSearchedProductView({
      title: originalProduct?.title,
      brand: originalProduct?.brand,
      imageUrl: originalProduct?.thumbnailUrl,
      price: originalProduct?.price,
    }),
    similarProducts: similarProducts.map((item, index) =>
      toSimilarProductView({ ...item, siteLabel: item.siteName }, index, {
        price: originalProduct?.price,
        currency: originalProduct?.currency,
      })
    ),
    productCount: totalCount ?? similarProducts.length,
  };
};

/**
 * job 비교 결과 → CompareResult UI가 그리는 형태.
 * 원본 상품은 result 안이 아니라 상태 응답 최상위(originalProduct)에 있어 따로 받는다.
 * 유사 상품에는 판매처명이 없어 source를 라벨로 바꾼다.
 */
export const mapCompareJobToView = (
  originalProduct: OriginalProductResponse | undefined,
  result: JobResultResponse
): CompareResultViewModel => {
  const similarProducts = result.similarProducts ?? [];

  return {
    searchedProduct: toSearchedProductView({
      title: originalProduct?.title,
      imageUrl: originalProduct?.imageUrl,
      price: originalProduct?.price,
    }),
    similarProducts: similarProducts.map((item, index) =>
      toSimilarProductView(
        { ...item, siteLabel: getCompareSourceLabel(item.source) },
        index,
        { price: originalProduct?.price, currency: originalProduct?.currency }
      )
    ),
    productCount: result.totalCount ?? similarProducts.length,
  };
};
