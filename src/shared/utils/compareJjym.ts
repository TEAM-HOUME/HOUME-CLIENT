import type { SimilarProductItemResponse } from '@apis/__generated__/data-contracts';

export type CompareJjymTarget = Required<
  Pick<SimilarProductItemResponse, 'productId' | 'source'>
>;

export const getCompareJjymKey = ({ productId, source }: CompareJjymTarget) =>
  `${source}:${productId}`;

export const resolveCompareJjymTarget = (
  productId: string | number | null | undefined,
  source: string | null | undefined
): CompareJjymTarget | null => {
  if (productId == null || productId === '') return null;
  if (source !== 'EBAY' && source !== 'COUPANG' && source !== 'RAW')
    return null;

  return { productId: String(productId), source };
};
