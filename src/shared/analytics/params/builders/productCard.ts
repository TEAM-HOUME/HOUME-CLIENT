import type { SaveStatus, TriggerContext } from '@analytics/params/product';
import type { ProductCardParams } from '@analytics/params/productCard';

/** getProductCardParams 입력 — API/카드 뷰모델 공통 최소 필드 */
export interface ProductCardInput {
  id?: number;
  productId?: number;
  name?: string;
  title?: string;
  brand?: string;
  originalPrice?: number;
  finalPrice?: number;
  discountPrice?: number;
  categoryName?: string;
  product_category?: string;
  product_sub_category?: string;
  subCategory?: string;
  isSaved?: boolean;
  isLiked?: boolean;
  trigger_context?: TriggerContext;
  save_status?: SaveStatus;
}

/** GA comma-separated id list param (`product_ids`, `others_img_ids` 등) */
export const joinAnalyticsIds = <T extends { id?: number }>(
  items: T[]
): string | undefined =>
  items
    .map((item) => item.id)
    .filter((id): id is number => id !== undefined)
    .join(', ') || undefined;

/**
 * 상품 카드 클릭/노출 이벤트 공통 파라미터
 * undefined 필드는 track.ts 병합 시 자연히 제외됨
 */
export const getProductCardParams = (
  product: ProductCardInput
): ProductCardParams => {
  const productId = product.id ?? product.productId;
  const productName = product.name ?? product.title;
  const productPrice =
    product.finalPrice ?? product.discountPrice ?? product.originalPrice;

  const saveStatus =
    product.save_status ??
    (product.isSaved !== undefined
      ? product.isSaved
      : product.isLiked !== undefined
        ? product.isLiked
        : undefined);

  return {
    trigger_context: product.trigger_context,
    product_id: productId,
    product_name: productName,
    product_brand: product.brand,
    product_price: productPrice,
    product_category: product.categoryName ?? product.product_category,
    product_sub_category: product.subCategory ?? product.product_sub_category,
    save_status: saveStatus,
  };
};

/** GoSite / Save / Unsave 등 product_id·product_name만 스펙에 있는 이벤트 */
export const getProductCardIdNameParams = (
  product: ProductCardInput
): Pick<ProductCardParams, 'product_id' | 'product_name'> => {
  const { product_id, product_name } = getProductCardParams(product);
  return { product_id, product_name };
};

/** mypage listCard / feedCard onCard — id·name·price만 */
export const getProductCardIdNamePriceParams = (
  product: ProductCardInput
): Pick<ProductCardParams, 'product_id' | 'product_name' | 'product_price'> => {
  const full = getProductCardParams(product);
  return {
    product_id: full.product_id,
    product_name: full.product_name,
    product_price: full.product_price,
  };
};

/** resultList listCard — product_id만 */
export const getProductCardIdOnlyParams = (
  product: ProductCardInput
): Pick<ProductCardParams, 'product_id'> => ({
  product_id: product.id ?? product.productId,
});

/** 피드 onCard·view 등 카드 본문 클릭/노출 스펙 */
export const getProductCardOnCardParams = (
  product: ProductCardInput
): Pick<
  ProductCardParams,
  | 'product_id'
  | 'product_name'
  | 'product_brand'
  | 'product_price'
  | 'product_category'
> => {
  const full = getProductCardParams(product);
  return {
    product_id: full.product_id,
    product_name: full.product_name,
    product_brand: full.product_brand,
    product_price: full.product_price,
    product_category: full.product_category,
  };
};

/** 리스트 카드 click / GoSite 스펙 (mypage·resultList listCard 등) */
export const getProductCardListCardParams = (
  product: ProductCardInput
): Pick<
  ProductCardParams,
  | 'product_id'
  | 'product_name'
  | 'product_brand'
  | 'product_price'
  | 'product_category'
> => getProductCardOnCardParams(product);

/** resultRec curation 피드 — ProductInfo */
export const toProductCardInputFromProductInfo = (product: {
  id?: number;
  name?: string;
  brand?: string;
  mallName?: string;
  originalPrice?: number;
  finalPrice?: number;
  categoryName?: string;
}): ProductCardInput => ({
  productId: product.id,
  name: product.name,
  brand: product.brand ?? product.mallName,
  originalPrice: product.originalPrice,
  finalPrice: product.finalPrice,
  categoryName: product.categoryName,
});

/** resultList 선택 상품 — GenerateImageResultProductResponse */
export const toProductCardInputFromGenerateResultProduct = (
  item: Pick<
    ProductCardInput,
    'id' | 'productId' | 'name' | 'originalPrice' | 'finalPrice'
  >
): ProductCardInput => ({
  productId: item.id ?? item.productId,
  name: item.name,
  originalPrice: item.originalPrice,
  finalPrice: item.finalPrice,
});

/** resultList 유사 상품 피드 — SimilarItemResponse */
export const toProductCardInputFromSimilarItem = (
  item: Pick<
    ProductCardInput,
    'id' | 'productId' | 'name' | 'brand' | 'originalPrice' | 'finalPrice'
  >
): ProductCardInput => ({
  productId: item.id ?? item.productId,
  name: item.name,
  brand: item.brand,
  originalPrice: item.originalPrice,
  finalPrice: item.finalPrice,
});

/** mypage 찜 피드 — FurnitureItem */
export const toProductCardInputFromJjymFeed = (
  item: Pick<
    ProductCardInput,
    'productId' | 'name' | 'brand' | 'originalPrice' | 'finalPrice'
  > & {
    rawProductId?: number;
    productName?: string;
    brandName?: string;
    listPrice?: number;
    discountPrice?: number;
  }
): ProductCardInput => ({
  productId: item.rawProductId ?? item.productId,
  name: item.productName ?? item.name,
  brand: item.brandName ?? item.brand,
  originalPrice: item.listPrice ?? item.originalPrice,
  finalPrice: item.discountPrice ?? item.finalPrice,
});

/** mypage 사용 상품 — UsedProductResponse */
export const toProductCardInputFromUsedListProduct = (
  item: Pick<
    ProductCardInput,
    'productId' | 'name' | 'originalPrice' | 'finalPrice'
  > & {
    rawProductId?: number;
    productName?: string;
    listPrice?: number;
    discountPrice?: number;
  }
): ProductCardInput => ({
  productId: item.rawProductId ?? item.productId,
  name: item.productName ?? item.name,
  originalPrice: item.listPrice ?? item.originalPrice,
  finalPrice: item.discountPrice ?? item.finalPrice,
});
