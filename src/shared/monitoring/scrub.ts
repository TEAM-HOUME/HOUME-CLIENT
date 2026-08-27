import type { Breadcrumb, ErrorEvent } from '@sentry/react';

/**
 * 개인정보·자격증명 스크럽
 *
 * Sentry는 요청 URL과 breadcrumb를 자동으로 수집하는데, 하우미는 카카오 인가코드를
 * 쿼리 파라미터로 보낸다(`/oauth/kakao/callback?code=...`).
 * 헤더·쿠키만 지우는 것(기존 scrub)으로는 부족해서 URL 계열을 전부 이 모듈에서 걸러낸다.
 */

/**
 * 값이 노출되면 안 되는 쿼리 파라미터 키 (소문자로 비교)
 *
 * 상품 검색어(`keyword`, `q`)는 **의도적으로 넣지 않는다.** 가구 검색어는 개인정보가 아니고,
 * "어떤 검색어에서 에러가 나는가"가 원인 파악에 직접 쓰인다. GA 이벤트로도 원문이
 * breadcrumb에 실리므로 여기서 막으면 같은 값이 한쪽만 가려져 오해를 부른다.
 */
const SENSITIVE_QUERY_KEYS = new Set([
  'code', // 카카오 OAuth 인가코드
  'token',
  'accesstoken',
  'access-token',
  'refreshtoken',
  'refresh-token',
  'signuptoken',
  'id_token',
  'email',
  'phone',
]);

const REDACTED = '[Filtered]';
/** 상대 경로도 URL로 파싱하기 위한 임시 base (외부로 나가지 않는 값) */
const RELATIVE_URL_BASE = 'https://redacted.invalid';
/** searchParams.set이 인코딩한 대괄호를 되돌려 가독성을 유지 */
const ENCODED_REDACTED = /%5BFiltered%5D/g;

const isSensitiveKey = (key: string) =>
  SENSITIVE_QUERY_KEYS.has(key.toLowerCase());

/**
 * URL을 받아 민감한 쿼리 파라미터 값을 [Filtered]로 치환한다.
 * 파싱할 수 없거나 치환 대상이 없으면 원본을 그대로 돌려준다.
 *
 * redact: 문서에서 민감한 부분을 가리는 것
 */
export const redactUrl = (rawUrl: string): string => {
  if (!rawUrl) return rawUrl;

  try {
    const isAbsolute = /^[a-z][a-z0-9+.-]*:/i.test(rawUrl);
    const url = new URL(rawUrl, RELATIVE_URL_BASE);

    const sensitiveKeys = [...url.searchParams.keys()].filter(isSensitiveKey);
    if (sensitiveKeys.length === 0) return rawUrl;

    sensitiveKeys.forEach((key) => url.searchParams.set(key, REDACTED));

    const redacted = isAbsolute
      ? url.toString()
      : `${url.pathname}${url.search}${url.hash}`;

    return redacted.replace(ENCODED_REDACTED, REDACTED);
  } catch {
    return rawUrl;
  }
};

/** `?a=1&code=xxx` 형태의 query string을 받아 민감 값을 찾고 치환한다 */
export const redactQueryString = (queryString: string): string => {
  if (!queryString) return queryString;

  try {
    const params = new URLSearchParams(queryString);

    const sensitiveKeys = [...params.keys()].filter(isSensitiveKey);
    if (sensitiveKeys.length === 0) return queryString;

    sensitiveKeys.forEach((key) => params.set(key, REDACTED));

    return params.toString().replace(ENCODED_REDACTED, REDACTED);
  } catch {
    return queryString;
  }
};

/** breadcrumb 객체를 받아 URL 계열 데이터의 민감 파라미터를 제거한다 */
export const redactBreadcrumb = (breadcrumb: Breadcrumb): Breadcrumb => {
  const data = breadcrumb.data;
  if (!data) return breadcrumb;

  // xhr/fetch는 url, navigation은 from/to에 URL이 담긴다
  (['url', 'from', 'to'] as const).forEach((key) => {
    const value: unknown = data[key];
    if (typeof value === 'string') {
      data[key] = redactUrl(value);
    }
  });

  return breadcrumb;
};

/** 에러 이벤트 객체를 받아 토큰·민감헤더·쿠키·URL 파라미터를 제거한다 */
export const scrubErrorEvent = (event: ErrorEvent): ErrorEvent => {
  const request = event.request;

  if (request) {
    const headers = request.headers;
    if (headers) {
      delete headers['Authorization'];
      delete headers['authorization'];
    }

    // withCredentials: true라 쿠키에 refresh token이 있을 수 있어 통째로 제거
    if (request.cookies) {
      delete request.cookies;
    }

    if (typeof request.url === 'string') {
      request.url = redactUrl(request.url);
    }

    if (typeof request.query_string === 'string') {
      request.query_string = redactQueryString(request.query_string);
    }
  }

  // beforeBreadcrumb를 거치지 않고 이벤트에 직접 붙은 breadcrumb도 한 번 더 확인
  event.breadcrumbs?.forEach(redactBreadcrumb);

  return event;
};
