import type { FurnitureProductInfo } from '@pages/generate/types/furniture';

const COLOR_NAME_TO_HEX_MAP: Record<string, string> = {
  화이트: '#FFFFFF',
  브라운: '#A52A2A',
  블루: '#0000FF',
  블랙: '#000000',
  베이지: '#F5F5DC',
  그린: '#008000',
  핑크: '#FFC0CB',
  옐로우: '#FFFF00',
  레드: '#FF0000',
  골드: '#FFD700',
  그레이: '#808080',
  실버: '#C0C0C0',
  오렌지: '#FFA500',
  바이올렛: '#EE82EE',
  네이비: '#000080',
};

export const RESULT_CARD_UI_FALLBACK = {
  productName: '상품명 준비중',
  mallName: '브랜드 준비중',
  originalPrice: 0,
  discountPrice: 0,
  discountRate: 0,
  colorHexes: Object.values(COLOR_NAME_TO_HEX_MAP),
  saveCount: 0,
} as const;

export interface CardProductModel {
  id?: number;
  isRecommendId: boolean;
  furnitureProductId: number | string;
  furnitureProductName: string;
  furnitureProductBrandName: string;
  furnitureProductImageUrl: string;
  furnitureProductSiteUrl: string;
  furnitureProductOriginalPrice: number;
  furnitureProductDiscountPrice: number;
  furnitureProductDiscountRate: number;
  furnitureProductColorHexes: string[];
  furnitureProductSaveCount: number;
}

const normalizeText = (value: unknown, fallback: string) => {
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : fallback;
};

const toFiniteNumber = (value: unknown) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const toFiniteProductId = (
  value: FurnitureProductInfo['furnitureProductId']
) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  if (typeof value === 'string') {
    const normalized = value.trim();
    if (normalized.length === 0) return null;
    const numeric = Number(normalized);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
  }

  return null;
};

export const normalizeColorHexes = (value: unknown) => {
  if (!Array.isArray(value)) return [];

  return value
    .filter((color): color is string => typeof color === 'string')
    .map((color) => color.trim())
    .map((color) => {
      if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)) return color;
      return COLOR_NAME_TO_HEX_MAP[color] ?? null;
    })
    .filter((color): color is string => Boolean(color));
};

const pickColorHexes = (product: FurnitureProductInfo) => {
  const clientColors = normalizeColorHexes(product.clientColors);
  if (clientColors.length > 0) return clientColors;

  const colors = normalizeColorHexes(product.colors);
  if (colors.length > 0) return colors;

  const legacyColorHexes = normalizeColorHexes(
    product.furnitureProductColorHexes
  );
  if (legacyColorHexes.length > 0) return legacyColorHexes;

  return [...RESULT_CARD_UI_FALLBACK.colorHexes];
};

export const normalizeProductsForCard = (
  products: FurnitureProductInfo[]
): CardProductModel[] => {
  return products.map((product, index) => {
    const byRecommend = product.id;
    const recommendId =
      typeof byRecommend === 'number' && Number.isFinite(byRecommend)
        ? byRecommend
        : undefined;
    const byProductId = toFiniteProductId(product.furnitureProductId);
    const safeProductId =
      byProductId !== null ? byProductId : `fallback-${index + 1}`;

    const originalPrice = toFiniteNumber(
      product.listPrice ?? product.furnitureProductOriginalPrice
    );
    const discountPrice = toFiniteNumber(
      product.discountPrice ?? product.furnitureProductDiscountPrice
    );
    const discountRate = toFiniteNumber(
      product.discountRate ?? product.furnitureProductDiscountRate
    );
    const saveCount = toFiniteNumber(
      product.jjymCount ?? product.furnitureProductSaveCount
    );
    const brandName = normalizeText(
      product.brandName,
      normalizeText(
        product.furnitureProductMallName,
        RESULT_CARD_UI_FALLBACK.mallName
      )
    );

    return {
      id: recommendId,
      isRecommendId: Boolean(recommendId),
      furnitureProductId: safeProductId,
      furnitureProductName: normalizeText(
        product.furnitureProductName,
        RESULT_CARD_UI_FALLBACK.productName
      ),
      furnitureProductBrandName: brandName,
      furnitureProductImageUrl:
        product.furnitureProductImageUrl || product.baseFurnitureImageUrl,
      furnitureProductSiteUrl: product.furnitureProductSiteUrl,
      furnitureProductOriginalPrice:
        originalPrice ?? RESULT_CARD_UI_FALLBACK.originalPrice,
      furnitureProductDiscountPrice:
        discountPrice ?? RESULT_CARD_UI_FALLBACK.discountPrice,
      furnitureProductDiscountRate:
        discountRate ?? RESULT_CARD_UI_FALLBACK.discountRate,
      furnitureProductColorHexes: pickColorHexes(product),
      furnitureProductSaveCount: saveCount ?? RESULT_CARD_UI_FALLBACK.saveCount,
    };
  });
};
