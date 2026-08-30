// ------------------------------
// 가격 비교(C-1) API 타입
// ------------------------------
// 2026-08-27 서버 확정 명세 기준.
//   POST /api/v1/price-compare/jobs           — job 생성
//   GET  /api/v1/price-compare/jobs/{jobId}   — 상태·결과 조회 (폴링 대상)
//
// 주의: job 실패는 HTTP 에러가 아니라 200 + `status: 'FAILED'`로 온다.
// 실패 판단은 HTTP 상태가 아니라 `status`로, 분기는 `errorMessage`가 아니라 `errorCode`로 한다.

/** job 전체 상태. PENDING·RUNNING이 진행 중이다 */
export const COMPARE_JOB_STATUS = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  DONE: 'DONE',
  FAILED: 'FAILED',
} as const;

export type CompareJobStatus =
  (typeof COMPARE_JOB_STATUS)[keyof typeof COMPARE_JOB_STATUS];

/** 파이프라인 단계 — 로딩 뷰의 단계 문구가 이 값에 매핑된다 */
export const COMPARE_JOB_STAGE = {
  SCRAPING: 'SCRAPING',
  SEARCHING: 'SEARCHING',
  MERGING: 'MERGING',
  SORTING: 'SORTING',
} as const;

export type CompareJobStage =
  (typeof COMPARE_JOB_STAGE)[keyof typeof COMPARE_JOB_STAGE];

/** SEARCHING 단계에서 3개 소스가 병렬로 도는 동안 각각의 상태 */
export const COMPARE_SOURCE_STATUS = {
  WAITING: 'WAITING',
  RUNNING: 'RUNNING',
  DONE: 'DONE',
  FAILED: 'FAILED',
} as const;

export type CompareSourceStatus =
  (typeof COMPARE_SOURCE_STATUS)[keyof typeof COMPARE_SOURCE_STATUS];

/** 유사 상품을 찾아온 곳 */
export const COMPARE_SOURCE = {
  CATALOG: 'CATALOG',
  COUPANG: 'COUPANG',
  EBAY: 'EBAY',
} as const;

export type CompareSource =
  (typeof COMPARE_SOURCE)[keyof typeof COMPARE_SOURCE];

/** 원본 상품에서 뽑아낸 정보가 얼마나 채워졌는지 */
export const COMPARE_QUALITY = {
  FULL: 'FULL',
  PARTIAL: 'PARTIAL',
  MINIMAL: 'MINIMAL',
} as const;

export type CompareQuality =
  (typeof COMPARE_QUALITY)[keyof typeof COMPARE_QUALITY];

/**
 * 비교를 시작한 경로.
 *
 * 확정된 job 생성 API의 request body에는 url만 있어서 서버로 보내지 않는다.
 * GA 이벤트 파라미터로만 쓴다 (명세의 `source: "deeplink"` 요구가 여기에 해당).
 */
export const COMPARE_ENTRY_SOURCE = {
  DEEPLINK: 'deeplink',
  INPUT: 'input',
  HISTORY: 'history',
  PRESET: 'preset',
} as const;

export type CompareEntrySource =
  (typeof COMPARE_ENTRY_SOURCE)[keyof typeof COMPARE_ENTRY_SOURCE];

/** 사용자가 넣은 원본 상품 — 결과 화면 맨 위 "검색한 상품" 카드가 쓴다 */
export interface CompareOriginalProduct {
  /** 서버가 정규화한 원본 상품 URL */
  sourceUrl: string;
  title: string | null;
  thumbnailUrl: string | null;
  /** 오늘의집 등 브랜드를 안 내주는 몰은 null */
  brand: string | null;
  /** 가격을 노출하지 않는 몰은 null */
  price: number | null;
  currency: string | null;
  quality: CompareQuality;
}

export interface CompareSimilarProduct {
  source: CompareSource;
  /** 소스 안에서의 상품 식별자. 소스가 다르면 값이 겹칠 수 있다 */
  productId: string;
  title: string;
  imageUrl: string;
  price: number;
  /** eBay 결과는 USD가 올 수 있다 */
  currency: string;
  /** 화면 표기용 판매처명 */
  siteName: string;
  productUrl: string;
  /** 0~1로 정규화된 유사도. 서버 기본 정렬 기준 */
  similarityScore: number;
  /** 이 가격이 언제 기준인지 (ISO 8601) */
  priceUpdatedAt: string;
  isAffiliate: boolean;
}

export interface CompareResult {
  originalProduct: CompareOriginalProduct;
  /** 0건이어도 실패가 아니다 — empty 뷰로 간다 */
  similarProducts: CompareSimilarProduct[];
  totalCount: number;
}

interface CompareJobBase {
  jobId: string;
  currentStage: CompareJobStage;
  sources: Record<'catalog' | 'coupang' | 'ebay', CompareSourceStatus>;
  /** ISO 8601 */
  startedAt: string;
  /** 진행 중이면 null */
  completedAt: string | null;
}

/**
 * 상태 조회 응답. status로 갈라진다.
 * 진행 중과 실패일 때 result가 null이라는 것을 타입에서 보장해 뷰에서 옵셔널 체이닝을 사용하지 않는다.
 */
export type CompareJobStatusResponse = CompareJobBase &
  (
    | {
        status:
          | typeof COMPARE_JOB_STATUS.PENDING
          | typeof COMPARE_JOB_STATUS.RUNNING;
        result: null;
      }
    | { status: typeof COMPARE_JOB_STATUS.DONE; result: CompareResult }
    | {
        status: typeof COMPARE_JOB_STATUS.FAILED;
        errorCode: number;
        errorMessage: string;
        result: null;
      }
  );

export interface CreateCompareJobRequest {
  url: string;
}

export interface CreateCompareJobResponse {
  jobId: string;
  status: CompareJobStatus;
}
