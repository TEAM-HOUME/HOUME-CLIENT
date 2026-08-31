import type {
  ComparePresetResponse,
  CompareResult,
} from '@pages/home/types/compare';

import type {
  LinkInfo,
  PriceInfo,
  ProductInfo,
  SaveInfo,
} from '@shared/types/productCard';

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

export interface CompareResultViewModel {
  searchedProduct: {
    product: ProductInfo;
    price?: PriceInfo;
  };
  similarProducts: CompareResultViewProduct[];
  productCount: number;
}

/**
 * job·프리셋 비교 결과 → CompareResult UI가 그리는 형태.
 * 화면이 쓰는 필드만 맞춘다. job의 quality·similarityScore 등은 여기서 버린다.
 */
export const mapCompareResultToView = (
  result: CompareResult | ComparePresetResponse
): CompareResultViewModel => {
  const { originalProduct, similarProducts, totalCount } = result;
  const originalPrice = originalProduct.price;
  const originalCurrency = originalProduct.currency;

  return {
    searchedProduct: {
      product: {
        brand: originalProduct.brand ?? undefined,
        title: originalProduct.title ?? '',
        imageUrl: originalProduct.thumbnailUrl ?? undefined,
      },
      price:
        originalPrice != null
          ? {
              original: originalPrice,
            }
          : undefined,
    },
    similarProducts: similarProducts.map((item, index) => {
      // TODO: PriceInfo/ProductCard가 통화를 안 받아 KRW가 아닌 금액도 원화처럼 표시된다.
      // 환율 변환 없이 다른 통화끼리 빼면 절감액이 틀리므로, 통화가 같을 때만 계산한다.
      const canCompareBenefit =
        originalPrice != null &&
        originalCurrency != null &&
        originalCurrency === item.currency;

      return {
        id: index + 1,
        product: {
          brand: item.siteName ?? undefined,
          title: item.title,
          imageUrl: item.imageUrl ?? undefined,
        },
        price: {
          original: item.price,
        },
        save: NOOP_SAVE,
        link: {
          href: item.productUrl,
          label: item.siteName ?? undefined,
        },
        benefitAmount: canCompareBenefit
          ? Math.max(0, originalPrice - item.price)
          : 0,
      };
    }),
    productCount: totalCount,
  };
};
