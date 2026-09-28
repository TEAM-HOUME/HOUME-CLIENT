import { getCompareSourceLabel } from '@pages/home/constants/compareSourceLabel';
import { calculateCompareBenefitAmount } from '@pages/home/utils/compareJobPresentation';

import type {
  LinkInfo,
  PriceInfo,
  ProductInfo,
} from '@shared/types/productCard';

import type {
  JobResultResponse,
  OriginalProductResponse,
  PresetDetailResponse,
} from '@apis/__generated__/data-contracts';

import {
  resolveCompareJjymTarget,
  type CompareJjymTarget,
} from '@utils/compareJjym';

export interface CompareResultViewProduct {
  id: number;
  product: ProductInfo;
  price: PriceInfo;
  link: LinkInfo;
  benefitAmount: number;
  saveTarget: CompareJjymTarget | null;
}

/** 결과 화면 맨 위 "검색한 상품" 카드가 그리는 형태. 로딩 중에도 이 값만 있으면 먼저 그린다 */
export interface CompareSearchedProductView {
  product: ProductInfo;
  price?: PriceInfo;
  href?: string;
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
  sourceUrl?: string;
}

export const toSearchedProductView = ({
  title,
  brand,
  imageUrl,
  price,
  sourceUrl,
}: SearchedProductSource): CompareSearchedProductView => ({
  product: {
    brand,
    title: title ?? '',
    imageUrl,
  },
  price: price != null ? { original: price } : undefined,
  href: sourceUrl,
});

/** 유사 상품 한 건 → ProductCard 형태. job·프리셋 공통 */
interface SimilarProductSource {
  title?: string;
  imageUrl?: string;
  price?: number;
  productUrl?: string;
  /** 판매처명. 프리셋은 siteName, job은 source를 라벨로 바꿔 넘긴다 */
  siteLabel?: string;
  productId?: string;
  source?: string;
}

interface OriginalPriceSource {
  price?: number;
}

const toSimilarProductView = (
  item: SimilarProductSource,
  index: number,
  original: OriginalPriceSource
): CompareResultViewProduct => {
  const benefitAmount = calculateCompareBenefitAmount(
    original.price,
    item.price
  );

  return {
    id: index + 1,
    product: {
      // TODO: 비교 상품 응답에 실제 brand가 추가되면 판매처명 대신 브랜드를 노출한다.
      brand: item.siteLabel,
      title: item.title ?? '',
      imageUrl: item.imageUrl,
    },
    price: {
      original: item.price,
    },
    link: {
      href: item.productUrl,
    },
    benefitAmount,
    saveTarget: resolveCompareJjymTarget(item.productId, item.source),
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
  const original = {
    price: originalProduct?.price,
  };

  return {
    // 프리셋 원본 상품은 이미지 필드명이 thumbnailUrl이라 job과 달리 직접 옮긴다
    searchedProduct: toSearchedProductView({
      title: originalProduct?.title,
      brand: originalProduct?.brand,
      imageUrl: originalProduct?.thumbnailUrl,
      price: originalProduct?.price,
      sourceUrl: originalProduct?.sourceUrl,
    }),
    similarProducts: similarProducts.map((item, index) =>
      toSimilarProductView(
        { ...item, siteLabel: item.siteName },
        index,
        original
      )
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
  originalProduct: OriginalProductResponse | null | undefined,
  result: JobResultResponse,
  sourceUrl?: string
): CompareResultViewModel => {
  const similarProducts = result.similarProducts ?? [];
  const original = {
    price: originalProduct?.price,
  };

  return {
    // TODO: 서버가 스크래핑 단계에서 originalProduct.brand 수집을 지원하면 검색한 상품 브랜드를 노출한다. 현재는 null이다.
    searchedProduct: toSearchedProductView({
      ...originalProduct,
      sourceUrl,
    }),
    similarProducts: similarProducts.map((item, index) =>
      toSimilarProductView(
        { ...item, siteLabel: getCompareSourceLabel(item.source) },
        index,
        original
      )
    ),
    productCount: result.totalCount ?? similarProducts.length,
  };
};
