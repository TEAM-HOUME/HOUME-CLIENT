// ------------------------------
// 가격 비교 에러 코드 (2026-08-27 서버 확정 명세 기준)
// ------------------------------
// 서버 안내: 실패 분기는 errorMessage 문구가 아니라 이 코드로 한다.

/** job이 FAILED로 끝났을 때 `data.errorCode`에 담기는 값 */
export const COMPARE_JOB_ERROR_CODE = {
  /** 유효하지 않은 상품 URL입니다. */
  INVALID_URL: 40033,
  /** 접근이 허용되지 않은 주소입니다. */
  FORBIDDEN_URL: 40034,
  /** 상품 페이지에서 정보를 추출하지 못했습니다. */
  EXTRACT_FAILED: 40035,
  /** 상품 페이지를 불러오지 못했습니다. — 재시도하면 될 수 있는 실패 */
  PAGE_LOAD_FAILED: 50204,
  /** 비교 처리 시간이 초과되었습니다. */
  TIMEOUT: 50025,
} as const;

export type CompareJobErrorCode =
  (typeof COMPARE_JOB_ERROR_CODE)[keyof typeof COMPARE_JOB_ERROR_CODE];

/** 재시도 버튼을 보여줄 실패 — 나머지는 URL을 바꿔야 하므로 입력으로 되돌린다 */
export const RETRYABLE_COMPARE_JOB_ERROR_CODES: readonly number[] = [
  COMPARE_JOB_ERROR_CODE.PAGE_LOAD_FAILED,
  COMPARE_JOB_ERROR_CODE.TIMEOUT,
];

/** HTTP 에러 응답의 `code` — job 실패가 아니라 요청 자체가 거절된 경우 */
export const COMPARE_REQUEST_ERROR_CODE = {
  /** 404 — 없는 jobId. 만료됐거나 조작된 값 */
  JOB_NOT_FOUND: 40428,
  /** 404 — 지원하지 않는 쇼핑몰 */
  UNSUPPORTED_URL: 40400,
  /** 400 — 유효하지 않은 상품 URL */
  INVALID_URL: 40033,
  /** 400 — 접근이 허용되지 않은 주소 */
  FORBIDDEN_URL: 40034,
} as const;
