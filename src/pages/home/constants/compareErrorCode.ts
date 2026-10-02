// ------------------------------
// 가격 비교 에러 코드
// ------------------------------
// HTTP 에러 응답의 `code` 또는 FAILED job 응답의 `errorCode`다.
// 서버 안내대로 실패 분기는 문구가 아니라 이 코드로 한다.
// 원본 페이지 로드 실패(50204)는 job 생성 요청 자체가 502로 거절되는 형태로 온다.

export const COMPARE_REQUEST_ERROR_CODE = {
  /** 400 — URL 형식은 맞지만 상품 링크로 사용할 수 없음 */
  INVALID_URL: 40033,
  /** 400 — 접근이 허용되지 않은 주소 (이전 서버 명세) */
  FORBIDDEN_URL: 40034,
  /** 상품 페이지에서 정보를 추출하지 못함 (이전 서버 명세) */
  EXTRACT_FAILED: 40035,
  /** 상품 정보를 조회할 수 없음 */
  PRODUCT_INFO_UNAVAILABLE: 40036,
  /** 삭제되었거나 판매가 종료된 상품 */
  PRODUCT_SALE_ENDED: 40037,
  /** 상품 정보 스크래핑이 차단된 사이트 */
  SCRAPING_BLOCKED: 40038,
  /** 서버 내부 오류 */
  INTERNAL_SERVER_ERROR: 40039,
  /** 동시 요청이 많아 처리가 지연됨 */
  TOO_MANY_USERS: 42901,
  /** 404 — 없는 jobId. 만료됐거나 조작된 값 (실측) */
  JOB_NOT_FOUND: 40428,
  /** 404 — 존재하지 않는 프리셋 (실측) */
  PRESET_NOT_FOUND: 40430,
  /**
   * 404 — "지원하지 않는 URL입니다."
   * 서버 공통 코드라 존재하지 않는 API 경로를 불러도 같은 코드가 온다. 쇼핑몰 미지원 전용 코드인지는 미확인
   */
  UNSUPPORTED_URL: 40400,
  /** 502 — 상품 페이지를 불러오지 못함. job 생성 시점에 거절된다 (실측). 재시도하면 될 수 있는 실패 */
  PAGE_LOAD_FAILED: 50204,
  /** 비교 처리 시간 초과 (2026-08-27 서버 명세) */
  TIMEOUT: 50025,
  /** 비교 검색 단계 오류 */
  SEARCH_FAILED: 50026,
  /** 비교 검색 처리 시간 초과 */
  SEARCH_TIMEOUT: 50027,
  /** 비교 검색 결과 병합 오류 */
  MERGE_FAILED: 50028,
} as const;

export const COMPARE_ERROR_CASE = {
  PRODUCT_UNAVAILABLE: 'productUnavailable',
  SCRAPING_BLOCKED: 'scrapingBlocked',
  COMPARE_FAILED: 'compareFailed',
  BUSY: 'busy',
  TEMPORARY: 'temporary',
  INVALID_FORMAT: 'invalidFormat',
  INVALID_LINK: 'invalidLink',
} as const;

export type CompareErrorCase =
  (typeof COMPARE_ERROR_CASE)[keyof typeof COMPARE_ERROR_CASE];
