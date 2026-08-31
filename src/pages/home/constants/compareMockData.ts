// [임시 파일] 서버 API 연동 후 삭제
// ------------------------------
// 가격 비교 mock 응답 — 서버 API 연동 전까지 뷰가 소비할 값
// ------------------------------
// 2026-08-27 확정 명세의 응답 예시를 그대로 옮겨 만들었다. 실제 상품 정보가 아니다.
// 서버 연동이 끝나면 이 파일은 지운다.

import { COMPARE_JOB_ERROR_CODE } from '@pages/home/constants/compareErrorCode';
import {
  COMPARE_JOB_STAGE,
  COMPARE_JOB_STATUS,
  COMPARE_QUALITY,
  COMPARE_SOURCE,
  COMPARE_SOURCE_STATUS,
  type CompareHistoryResponse,
  type CompareJobStatusResponse,
  type CompareOriginalProduct,
  type ComparePresetResponse,
  type ComparePresetsResponse,
  type CompareSimilarProduct,
} from '@pages/home/types/compare';

const MOCK_JOB_ID = '01J9XKQ7A3M2VN8TDYE4RC0PZB';
const MOCK_STARTED_AT = '2026-08-23T14:02:11+09:00';
const MOCK_COMPLETED_AT = '2026-08-23T14:02:18+09:00';
const MOCK_PRICE_UPDATED_AT = '2026-08-23T14:02:15+09:00';

const MOCK_ORIGINAL_PRODUCT: CompareOriginalProduct = {
  sourceUrl: 'https://store.ohou.se/goods/3603649',
  title: '노엘 반자동 리프트업 통수납 침대프레임 SS/Q',
  thumbnailUrl:
    'https://prs.ohousecdn.com/apne2/any/uploads/productions/v1-393443018530944.jpg',
  brand: null,
  price: 149000,
  currency: 'KRW',
  quality: COMPARE_QUALITY.PARTIAL,
};

/** similarityScore 내림차순 — 서버가 정렬해서 주는 순서 그대로라는 전제 */
const MOCK_SIMILAR_PRODUCTS: CompareSimilarProduct[] = [
  {
    productId: '12345',
    title: '리프트업 수납 침대프레임 SS',
    price: 139000,
    siteName: '하우미',
    source: COMPARE_SOURCE.CATALOG,
    similarityScore: 0.92,
    isAffiliate: false,
    imageUrl: 'https://cdn.houme.kr/products/12345.jpg',
    productUrl: 'https://houme.kr/products/12345',
    currency: 'KRW',
    priceUpdatedAt: MOCK_PRICE_UPDATED_AT,
  },
  {
    productId: '7225189423',
    title: '쿠팡 리프트업 침대 슈퍼싱글',
    price: 158000,
    siteName: '쿠팡',
    source: COMPARE_SOURCE.COUPANG,
    similarityScore: 0.87,
    isAffiliate: true,
    imageUrl: 'https://cdn.houme.kr/products/7225189423.jpg',
    productUrl: 'https://houme.kr/products/7225189423',
    currency: 'KRW',
    priceUpdatedAt: MOCK_PRICE_UPDATED_AT,
  },
  {
    productId: '12377',
    title: '통수납 침대프레임 퀸',
    price: 121000,
    siteName: '하우미',
    source: COMPARE_SOURCE.CATALOG,
    similarityScore: 0.85,
    isAffiliate: false,
    imageUrl: 'https://cdn.houme.kr/products/12377.jpg',
    productUrl: 'https://houme.kr/products/12377',
    currency: 'KRW',
    priceUpdatedAt: MOCK_PRICE_UPDATED_AT,
  },
  {
    productId: '7225190011',
    title: '반자동 리프트업 수납침대 Q',
    price: 178000,
    siteName: '쿠팡',
    source: COMPARE_SOURCE.COUPANG,
    similarityScore: 0.83,
    isAffiliate: true,
    imageUrl: 'https://cdn.houme.kr/products/7225190011.jpg',
    productUrl: 'https://houme.kr/products/7225190011',
    currency: 'KRW',
    priceUpdatedAt: MOCK_PRICE_UPDATED_AT,
  },
  {
    productId: '204488317755',
    title: 'Storage Bed Frame Queen Lift Up',
    price: 236000,
    siteName: 'eBay',
    source: COMPARE_SOURCE.EBAY,
    similarityScore: 0.81,
    isAffiliate: false,
    imageUrl: 'https://cdn.houme.kr/products/204488317755.jpg',
    productUrl: 'https://houme.kr/products/204488317755',
    currency: 'KRW',
    priceUpdatedAt: MOCK_PRICE_UPDATED_AT,
  },
  {
    productId: '12402',
    title: '서랍형 침대프레임 SS',
    price: 98000,
    siteName: '하우미',
    source: COMPARE_SOURCE.CATALOG,
    similarityScore: 0.79,
    isAffiliate: false,
    imageUrl: 'https://cdn.houme.kr/products/12402.jpg',
    productUrl: 'https://houme.kr/products/12402',
    currency: 'KRW',
    priceUpdatedAt: MOCK_PRICE_UPDATED_AT,
  },
  {
    productId: '7225191288',
    title: '침대프레임 슈퍼싱글 수납형',
    price: 132000,
    siteName: '쿠팡',
    source: COMPARE_SOURCE.COUPANG,
    similarityScore: 0.77,
    isAffiliate: true,
    imageUrl: 'https://cdn.houme.kr/products/7225191288.jpg',
    productUrl: 'https://houme.kr/products/7225191288',
    currency: 'KRW',
    priceUpdatedAt: MOCK_PRICE_UPDATED_AT,
  },
  {
    productId: '12455',
    title: '헤드리스 수납 침대 퀸',
    price: 168000,
    siteName: '하우미',
    source: COMPARE_SOURCE.CATALOG,
    similarityScore: 0.75,
    isAffiliate: false,
    imageUrl: 'https://cdn.houme.kr/products/12455.jpg',
    productUrl: 'https://houme.kr/products/12455',
    currency: 'KRW',
    priceUpdatedAt: MOCK_PRICE_UPDATED_AT,
  },
  {
    productId: '204488319902',
    title: 'Lift Up Ottoman Bed Super Single',
    price: 289000,
    siteName: 'eBay',
    source: COMPARE_SOURCE.EBAY,
    similarityScore: 0.73,
    isAffiliate: false,
    imageUrl: 'https://cdn.houme.kr/products/204488319902.jpg',
    productUrl: 'https://houme.kr/products/204488319902',
    currency: 'KRW',
    priceUpdatedAt: MOCK_PRICE_UPDATED_AT,
  },
  {
    productId: '7225193040',
    title: '원목 수납침대 SS 프레임',
    price: 145000,
    siteName: '쿠팡',
    source: COMPARE_SOURCE.COUPANG,
    similarityScore: 0.71,
    isAffiliate: true,
    imageUrl: 'https://cdn.houme.kr/products/7225193040.jpg',
    productUrl: 'https://houme.kr/products/7225193040',
    currency: 'KRW',
    priceUpdatedAt: MOCK_PRICE_UPDATED_AT,
  },
  {
    productId: '12490',
    title: '패브릭 수납 침대프레임 Q',
    price: 199000,
    siteName: '하우미',
    source: COMPARE_SOURCE.CATALOG,
    similarityScore: 0.69,
    isAffiliate: false,
    imageUrl: 'https://cdn.houme.kr/products/12490.jpg',
    productUrl: 'https://houme.kr/products/12490',
    currency: 'KRW',
    priceUpdatedAt: MOCK_PRICE_UPDATED_AT,
  },
  {
    productId: '7225194511',
    title: '저상형 침대프레임 슈퍼싱글',
    price: 89000,
    siteName: '쿠팡',
    source: COMPARE_SOURCE.COUPANG,
    similarityScore: 0.67,
    isAffiliate: true,
    imageUrl: 'https://cdn.houme.kr/products/7225194511.jpg',
    productUrl: 'https://houme.kr/products/7225194511',
    currency: 'KRW',
    priceUpdatedAt: MOCK_PRICE_UPDATED_AT,
  },
  {
    productId: '12512',
    title: '통수납 평상형 침대 SS',
    price: 112000,
    siteName: '하우미',
    source: COMPARE_SOURCE.CATALOG,
    similarityScore: 0.65,
    isAffiliate: false,
    imageUrl: 'https://cdn.houme.kr/products/12512.jpg',
    productUrl: 'https://houme.kr/products/12512',
    currency: 'KRW',
    priceUpdatedAt: MOCK_PRICE_UPDATED_AT,
  },
  {
    productId: '204488322341',
    title: 'Hydraulic Storage Bed Frame',
    price: 312000,
    siteName: 'eBay',
    source: COMPARE_SOURCE.EBAY,
    similarityScore: 0.63,
    isAffiliate: false,
    imageUrl: 'https://cdn.houme.kr/products/204488322341.jpg',
    productUrl: 'https://houme.kr/products/204488322341',
    currency: 'KRW',
    priceUpdatedAt: MOCK_PRICE_UPDATED_AT,
  },
  {
    productId: '7225196077',
    title: '가죽 수납침대 퀸 프레임',
    price: 224000,
    siteName: '쿠팡',
    source: COMPARE_SOURCE.COUPANG,
    similarityScore: 0.61,
    isAffiliate: true,
    imageUrl: 'https://cdn.houme.kr/products/7225196077.jpg',
    productUrl: 'https://houme.kr/products/7225196077',
    currency: 'KRW',
    priceUpdatedAt: MOCK_PRICE_UPDATED_AT,
  },
  {
    productId: '12540',
    title: '깔판형 침대프레임 SS',
    price: 76000,
    siteName: '하우미',
    source: COMPARE_SOURCE.CATALOG,
    similarityScore: 0.59,
    isAffiliate: false,
    imageUrl: 'https://cdn.houme.kr/products/12540.jpg',
    productUrl: 'https://houme.kr/products/12540',
    currency: 'KRW',
    priceUpdatedAt: MOCK_PRICE_UPDATED_AT,
  },
  {
    productId: '7225197655',
    title: '서랍 4단 수납침대 Q',
    price: 189000,
    siteName: '쿠팡',
    source: COMPARE_SOURCE.COUPANG,
    similarityScore: 0.57,
    isAffiliate: true,
    imageUrl: 'https://cdn.houme.kr/products/7225197655.jpg',
    productUrl: 'https://houme.kr/products/7225197655',
    currency: 'KRW',
    priceUpdatedAt: MOCK_PRICE_UPDATED_AT,
  },
  {
    productId: '12566',
    title: '멀티 수납 침대프레임 퀸',
    price: 205000,
    siteName: '하우미',
    source: COMPARE_SOURCE.CATALOG,
    similarityScore: 0.55,
    isAffiliate: false,
    imageUrl: 'https://cdn.houme.kr/products/12566.jpg',
    productUrl: 'https://houme.kr/products/12566',
    currency: 'KRW',
    priceUpdatedAt: MOCK_PRICE_UPDATED_AT,
  },
  {
    productId: '204488325518',
    title: 'Wooden Platform Storage Bed',
    price: 174000,
    siteName: 'eBay',
    source: COMPARE_SOURCE.EBAY,
    similarityScore: 0.53,
    isAffiliate: false,
    imageUrl: 'https://cdn.houme.kr/products/204488325518.jpg',
    productUrl: 'https://houme.kr/products/204488325518',
    currency: 'KRW',
    priceUpdatedAt: MOCK_PRICE_UPDATED_AT,
  },
  {
    productId: '7225199120',
    title: '조립식 수납침대 슈퍼싱글',
    price: 104000,
    siteName: '쿠팡',
    source: COMPARE_SOURCE.COUPANG,
    similarityScore: 0.51,
    isAffiliate: true,
    imageUrl: 'https://cdn.houme.kr/products/7225199120.jpg',
    productUrl: 'https://houme.kr/products/7225199120',
    currency: 'KRW',
    priceUpdatedAt: MOCK_PRICE_UPDATED_AT,
  },
];

const MOCK_JOB_BASE = {
  jobId: MOCK_JOB_ID,
  sources: {
    catalog: COMPARE_SOURCE_STATUS.DONE,
    coupang: COMPARE_SOURCE_STATUS.DONE,
    ebay: COMPARE_SOURCE_STATUS.DONE,
  },
  startedAt: MOCK_STARTED_AT,
};

/** 완료 — 결과 뷰 확인용. 원본 149,000원보다 싼 상품이 12개라 "저렴" 배지 케이스가 나온다 */
export const MOCK_COMPARE_JOB_DONE: CompareJobStatusResponse = {
  ...MOCK_JOB_BASE,
  status: COMPARE_JOB_STATUS.DONE,
  currentStage: COMPARE_JOB_STAGE.SORTING,
  completedAt: MOCK_COMPLETED_AT,
  result: {
    originalProduct: MOCK_ORIGINAL_PRODUCT,
    similarProducts: MOCK_SIMILAR_PRODUCTS,
    totalCount: MOCK_SIMILAR_PRODUCTS.length,
  },
};

/** 결과 0건 — empty 뷰 확인용. 실패가 아니라 DONE이다 */
export const MOCK_COMPARE_JOB_EMPTY: CompareJobStatusResponse = {
  ...MOCK_JOB_BASE,
  status: COMPARE_JOB_STATUS.DONE,
  currentStage: COMPARE_JOB_STAGE.SORTING,
  completedAt: MOCK_COMPLETED_AT,
  result: {
    originalProduct: MOCK_ORIGINAL_PRODUCT,
    similarProducts: [],
    totalCount: 0,
  },
};

/** 실패 — 에러 뷰 확인용. HTTP는 200이고 status가 FAILED다 */
export const MOCK_COMPARE_JOB_FAILED: CompareJobStatusResponse = {
  ...MOCK_JOB_BASE,
  status: COMPARE_JOB_STATUS.FAILED,
  currentStage: COMPARE_JOB_STAGE.SCRAPING,
  sources: {
    catalog: COMPARE_SOURCE_STATUS.WAITING,
    coupang: COMPARE_SOURCE_STATUS.WAITING,
    ebay: COMPARE_SOURCE_STATUS.WAITING,
  },
  completedAt: '2026-08-23T14:02:13+09:00',
  errorCode: COMPARE_JOB_ERROR_CODE.PAGE_LOAD_FAILED,
  errorMessage: '상품 페이지를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
  result: null,
};

/** GET /api/v1/price-compare/presets/{presetId} — 명세 성공 예시. 검색 화면 presetId=1과 대응 */
export const MOCK_COMPARE_PRESET_1: ComparePresetResponse = {
  originalProduct: {
    sourceUrl: 'https://www.ohou.se/productions/999999/selling',
    title: '룬드 무헤드 수납 침대 프레임 SS Q 슈퍼싱글 퀸',
    thumbnailUrl: 'https://cdn.ohou.se/thumb/999999.jpg',
    brand: null,
    price: 299000,
    currency: 'KRW',
  },
  similarProducts: [
    {
      source: COMPARE_SOURCE.EBAY,
      productId: 'A',
      title: 'Storage bed frame no headboard - A',
      imageUrl: 'https://example.com/a.jpg',
      price: 300000,
      currency: 'KRW',
      siteName: 'eBay',
      productUrl: 'https://example.com/a',
      priceUpdatedAt: '2026-08-24T05:10:00Z',
    },
  ],
  totalCount: 1,
};

/** 검색 화면 presetId=2(썸네일 없음)와 대응 */
export const MOCK_COMPARE_PRESET_2: ComparePresetResponse = {
  originalProduct: {
    sourceUrl: 'https://www.ohou.se/productions/888888/selling',
    title: '제품 이름',
    thumbnailUrl: null,
    brand: null,
    price: 89000,
    currency: 'KRW',
  },
  similarProducts: [
    {
      source: COMPARE_SOURCE.CATALOG,
      productId: 'B',
      title: '비슷한 수납 침대 프레임',
      imageUrl: 'https://cdn.houme.kr/products/preset-2.jpg',
      price: 79000,
      currency: 'KRW',
      siteName: '하우미',
      productUrl: 'https://houme.kr/products/preset-2',
      priceUpdatedAt: '2026-08-24T05:10:00Z',
    },
  ],
  totalCount: 1,
};

/** GET /api/v1/price-compare/jobs/history — 검색 화면 최근 비교 목록용 */
export const MOCK_COMPARE_HISTORY: CompareHistoryResponse = {
  items: [
    {
      sourceUrl: 'https://store.ohou.se/goods/3603649',
      thumbnailUrl:
        'https://prs.ohousecdn.com/apne2/any/uploads/productions/v1-393443018530944.jpg',
      title: '노엘 반자동 리프트업 통수납 침대프레임 SS/Q',
      price: 149_000,
      currency: 'KRW',
      createdAt: '2026-08-23T14:02:11+09:00',
    },
    {
      sourceUrl: 'https://store.ohou.se/goods/2981274',
      thumbnailUrl:
        'https://prs.ohousecdn.com/apne2/any/uploads/productions/v1-372918822210048.jpg',
      title: '플렌토 속 깊은 5단 서랍장 800',
      price: null,
      currency: null,
      createdAt: '2026-08-20T09:15:44+09:00',
    },
    {
      sourceUrl: 'https://store.ohou.se/goods/1234567',
      thumbnailUrl:
        'https://prs.ohousecdn.com/apne2/any/uploads/productions/v1-372918822210048.jpg',
      title: '룬드 무헤드 수납 침대 프레임 SS Q 슈퍼싱글 퀸',
      price: 89_000,
      currency: 'KRW',
      createdAt: '2026-08-18T10:00:00+09:00',
    },
  ],
};

/** GET /api/v1/price-compare/presets — 검색 화면 프리셋 목록용 */
export const MOCK_COMPARE_PRESETS: ComparePresetsResponse = {
  presets: [
    {
      presetId: 1,
      thumbnailUrl: 'https://cdn.ohou.se/thumb/999999.jpg',
      title: '룬드 무헤드 수납 침대 프레임 SS Q 슈퍼싱글 퀸',
    },
    {
      presetId: 2,
      thumbnailUrl: null,
      title: '제품 이름',
    },
  ],
};
