// ------------------------------
// 가격 비교(C-1) API 타입
// ------------------------------
// 응답 타입의 원본은 Swagger 생성 파일(`@apis/__generated__/data-contracts`)이다.
// 여기에는 생성 도구가 만들지 않는 것만 둔다 — 값 목록 상수, 상태별로 result 유무가 갈리는 화면용 유니온.
//
//   POST /api/v1/price-compare/jobs                 — job 생성 (202)                CreateCompareJobRequest → CreateJobResponse
//   GET  /api/v1/price-compare/jobs/{jobId}         — 상태·결과 조회 (폴링 대상)   CompareJobResponse
//   GET  /api/v1/price-compare/jobs/history         — 최근 비교 히스토리            CompareHistoryResponse
//   GET  /api/v1/price-compare/presets              — 프리셋 목록                   PresetListResponse
//   GET  /api/v1/price-compare/presets/{presetId}   — 프리셋 고정 결과 조회         PresetDetailResponse
//
// 2026-09-17 dev 서버 실측 (Swagger와 일치):
// - 진행 중(RUNNING) 응답에는 result 키가 없다(null이 아니라 없음). 파이프라인 단계·에러 코드·에러 문구 필드도 없다
// - 원본 상품 페이지를 못 긁으면 job이 만들어지지 않고 생성 요청이 HTTP 에러(502, code 50204)로 거절된다.
//   비동기로 FAILED가 되는 응답은 재현하지 못해 모양을 모른다
// - 유사 상품에는 판매처명·상품 id·유사도가 없다. 판매처는 source(EBAY·COUPANG·CATALOG)로 표기한다. eBay 결과는 USD로 온다
// - Swagger에 enum이 없어 status·source 같은 값은 string으로 생성된다. 아래 상수가 실제 값 목록이다

import type {
  CompareJobResponse,
  JobResultResponse,
} from '@apis/__generated__/data-contracts';

/** job 전체 상태. PENDING·RUNNING이 진행 중이다 (실측에서는 생성 직후부터 RUNNING) */
export const COMPARE_JOB_STATUS = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  DONE: 'DONE',
  FAILED: 'FAILED',
} as const;

export type CompareJobStatus =
  (typeof COMPARE_JOB_STATUS)[keyof typeof COMPARE_JOB_STATUS];

/** 유사 상품을 찾아온 곳 — 응답의 `similarProducts[].source` 값 */
export const COMPARE_SOURCE = {
  CATALOG: 'CATALOG',
  COUPANG: 'COUPANG',
  EBAY: 'EBAY',
} as const;

export type CompareSource =
  (typeof COMPARE_SOURCE)[keyof typeof COMPARE_SOURCE];

type CompareJobStatusBase = Omit<CompareJobResponse, 'status' | 'result'>;

/**
 * 상태 조회 응답. 생성 타입(CompareJobResponse)은 status가 string이라 화면에서 status로 갈라 쓰기 위해 좁힌다.
 * 진행 중·실패일 때는 result가 없다. DONE일 때도 서버가 required를 선언하지 않아 optional로 두고 읽는 쪽이 방어한다.
 */
export type CompareJobStatusResponse = CompareJobStatusBase &
  (
    | {
        status:
          | typeof COMPARE_JOB_STATUS.PENDING
          | typeof COMPARE_JOB_STATUS.RUNNING;
        result?: undefined;
      }
    | { status: typeof COMPARE_JOB_STATUS.DONE; result?: JobResultResponse }
    | { status: typeof COMPARE_JOB_STATUS.FAILED; result?: undefined }
  );
