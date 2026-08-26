import type {
  LinkInfo,
  PriceInfo,
  ProductInfo,
  SaveInfo,
} from '@shared/types/productCard';

import testImage from '@assets/images/TestImg.png';

interface MockCompareProduct {
  id: number;
  product: ProductInfo;
  price: PriceInfo;
  save: SaveInfo;
  link: LinkInfo;
  benefitAmount: number;
}

const MOCK_SAVE_INFO: SaveInfo = {
  isSaved: false,
  onToggle: () => undefined,
};

export const MOCK_SEARCHED_PRODUCT = {
  product: {
    brand: '브랜드명',
    title: '상품명은 최대 한 줄까지 표시됩니다.',
    imageUrl: testImage,
  },
  price: {
    original: 129_000,
    discount: 99_000,
    discountRate: 23,
  },
};

export const MOCK_SIMILAR_PRODUCT_COUNT = 20;

export const MOCK_SIMILAR_PRODUCTS: MockCompareProduct[] = Array.from(
  { length: MOCK_SIMILAR_PRODUCT_COUNT },
  (_, index) => ({
    id: index + 1,
    product: {
      brand: '브랜드명은 최대 한 줄까지 쓸 수 있어요.',
      title:
        '상품명은 최대 두 줄까지 쓸 수 있어요. 상품명은 최대 두 줄까지 쓸 수 있어요.',
      imageUrl: testImage,
    },
    price: {
      original: 129_000 + index * 10_000,
      discount: 99_000 + index * 10_000,
      discountRate: 23,
    },
    save: MOCK_SAVE_INFO,
    link: {
      href: 'https://example.com',
      label: '사이트',
    },
    benefitAmount: 30_000,
  })
);
