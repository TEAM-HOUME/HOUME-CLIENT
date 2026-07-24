import type { ProductItem } from '@store/imageFlow/flowConfig';

import type { GenerateImageResultProductResponse } from '@apis/__generated__/data-contracts';

/**
 * ListResult '선택한 상품' API 응답의 상품 한 건을 useImageFlowStore.preset.productsToBeRestored에 들어갈 ProductItem으로 변환
 * - ResultPage에서 ProductTab으로 이동한 뒤에 바텀시트에 선택한 상품을 띄울 수 있도록 ProductItem으로 변환시킴
 * - finalPrice → discountPrice 네이밍 변환
 * - brand는 ListResult 응답에 없으므로 빈 문자열 폴백
 *   - 어차피 ProductTab의 선택한 상품 바텀시트에서도 brand를 UI에 띄우지 않으므로 문제 X
 */
export const toProductItem = (
  product: GenerateImageResultProductResponse
): ProductItem => ({
  id: product.id!,
  title: product.name ?? '',
  brand: '',
  imageUrl: product.imageUrl,
  originalPrice: product.originalPrice ?? 0,
  discountPrice: product.finalPrice ?? 0,
  discountRate: product.discountRate ?? 0,
});
