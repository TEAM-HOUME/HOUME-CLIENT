import type {
  ComparePresetResult,
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
  result: CompareResult | ComparePresetResult
): CompareResultViewModel => {
  const { originalProduct, similarProducts, totalCount } = result;
  const originalPrice = originalProduct.price;

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
    similarProducts: similarProducts.map((item, index) => ({
      id: index + 1,
      product: {
        brand: item.siteName ?? undefined,
        title: item.title,
        imageUrl: item.imageUrl ?? undefined,
      },
      // TODO: item.currency 미반영. KRW가 아닌 항목(eBay 등)도 원화처럼 표시된다 —
      // ProductCard/PriceInfo가 통화를 안 받는 구조라 함께 손봐야 한다
      price: {
        original: item.price,
      },
      save: NOOP_SAVE,
      link: {
        href: item.productUrl,
        label: item.siteName ?? undefined,
      },
      benefitAmount:
        originalPrice != null ? Math.max(0, originalPrice - item.price) : 0,
    })),
    productCount: totalCount,
  };
};
