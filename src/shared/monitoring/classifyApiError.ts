import axios, { isAxiosError } from 'axios';

/**
 * API 에러 분류
 *
 * "무엇이 실패했는가"를 판별만 하는 순수 함수 모음
 * 전송 여부 판단은 apiReportPolicy가 맡는다(판별과 정책을 분리해 각각 테스트).
 */

/** 토큰 재발급 실패 시 axios 인터셉터가 던지는 통일 메시지 */
export const SESSION_EXPIRED_MESSAGE = 'SESSION_EXPIRED';

export const isSessionExpiredError = (error: unknown): boolean =>
  error instanceof Error && error.message === SESSION_EXPIRED_MESSAGE;

export const API_ERROR_KIND = {
  /** 토큰 재발급 실패 → 정상 로그아웃 플로우 */
  SESSION_EXPIRED: 'sessionExpired',
  /** 언마운트·중복 요청으로 취소됨 → 정상 */
  CANCELED: 'canceled',
  /** 요청 타임아웃 */
  TIMEOUT: 'timeout',
  /** 응답 자체를 받지 못함 (오프라인·DNS·CORS) */
  NETWORK: 'network',
  /** 4xx */
  CLIENT: 'client',
  /** 5xx */
  SERVER: 'server',
  /** axios 에러가 아닌 예상 못한 throw */
  UNKNOWN: 'unknown',
} as const;

export type ApiErrorKind = (typeof API_ERROR_KIND)[keyof typeof API_ERROR_KIND];

export interface ApiErrorInfo {
  kind: ApiErrorKind;
  /** HTTP 상태 코드 */
  status?: number;
  /** 서버 BaseResponse.code (비즈니스 에러 코드) */
  code?: number;
  /** 동적 세그먼트를 :id로 바꾼 경로 — 이슈가 id마다 쪼개지는 것을 막는다 */
  routePattern?: string;
  method?: string;
}

/** `/banners/123/items` → `/banners/:id/items` */
export const normalizeApiPath = (url?: string): string | undefined => {
  if (!url) return undefined;

  const path = url.split('?')[0] ?? url;

  return path
    .split('/')
    .map((segment) => (/^\d+$/.test(segment) ? ':id' : segment))
    .join('/');
};

/** 응답 바디에서 서버의 비즈니스 에러 코드만 안전하게 추출 */
const extractServerCode = (data: unknown): number | undefined => {
  if (!data || typeof data !== 'object') return undefined;

  const code = (data as { code?: unknown }).code;

  return typeof code === 'number' ? code : undefined;
};

/**
 * 에러를 종류별로 분류한다.
 * 판별 순서가 중요 — 위에서 먼저 걸리는 조건이 우선시
 */
export const classifyApiError = (error: unknown): ApiErrorInfo => {
  if (isSessionExpiredError(error)) {
    return { kind: API_ERROR_KIND.SESSION_EXPIRED };
  }

  if (axios.isCancel(error)) {
    return { kind: API_ERROR_KIND.CANCELED };
  }

  if (error instanceof Error && error.name === 'AbortError') {
    return { kind: API_ERROR_KIND.CANCELED };
  }

  if (!isAxiosError(error)) {
    return { kind: API_ERROR_KIND.UNKNOWN };
  }

  const base = {
    method: error.config?.method?.toUpperCase(),
    routePattern: normalizeApiPath(error.config?.url),
  };

  if (error.code === 'ERR_CANCELED') {
    return { ...base, kind: API_ERROR_KIND.CANCELED };
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return { ...base, kind: API_ERROR_KIND.TIMEOUT };
  }

  // 응답이 없으면 서버에 닿지 못한 것 (오프라인·DNS·CORS)
  if (!error.response) {
    return { ...base, kind: API_ERROR_KIND.NETWORK };
  }

  const status = error.response.status;
  const code = extractServerCode(error.response.data);

  if (status >= 500) {
    return { ...base, kind: API_ERROR_KIND.SERVER, status, code };
  }

  if (status >= 400) {
    return { ...base, kind: API_ERROR_KIND.CLIENT, status, code };
  }

  // 2xx/3xx인데 에러로 도달한 경우 (인터셉터가 변환했을 수 있음)
  return { ...base, kind: API_ERROR_KIND.UNKNOWN, status, code };
};
