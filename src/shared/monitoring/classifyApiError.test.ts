import { CanceledError } from 'axios';
import { describe, expect, it } from 'vitest';

import {
  API_ERROR_KIND,
  classifyApiError,
  isSessionExpiredError,
  normalizeApiPath,
} from './classifyApiError';

/** 테스트용 AxiosError 형태 (axios는 isAxiosError 플래그로 판별한다) */
const axiosError = (overrides: Record<string, unknown>) => ({
  isAxiosError: true,
  config: { method: 'get', url: '/api/v1/banners/12' },
  ...overrides,
});

describe('normalizeApiPath', () => {
  it('숫자 세그먼트를 :id로 바꾼다', () => {
    expect(normalizeApiPath('/api/v1/banners/123/items')).toBe(
      '/api/v1/banners/:id/items'
    );
  });

  it('쿼리 스트링을 제거한다', () => {
    expect(normalizeApiPath('/api/products?keyword=x')).toBe('/api/products');
  });

  it('url이 없으면 undefined를 반환한다', () => {
    expect(normalizeApiPath(undefined)).toBeUndefined();
  });
});

describe('isSessionExpiredError', () => {
  it('SESSION_EXPIRED 메시지인 Error만 true다', () => {
    expect(isSessionExpiredError(new Error('SESSION_EXPIRED'))).toBe(true);
    expect(isSessionExpiredError(new Error('Network Error'))).toBe(false);
    expect(isSessionExpiredError('SESSION_EXPIRED')).toBe(false);
  });
});

describe('classifyApiError — 판별 우선순위', () => {
  it('SESSION_EXPIRED가 가장 먼저 판별된다', () => {
    expect(classifyApiError(new Error('SESSION_EXPIRED')).kind).toBe(
      API_ERROR_KIND.SESSION_EXPIRED
    );
  });

  it('axios 취소는 canceled로 판별한다', () => {
    expect(classifyApiError(new CanceledError('canceled')).kind).toBe(
      API_ERROR_KIND.CANCELED
    );
  });

  it('AbortError는 canceled로 판별한다', () => {
    const error = new Error('aborted');
    error.name = 'AbortError';

    expect(classifyApiError(error).kind).toBe(API_ERROR_KIND.CANCELED);
  });

  it('axios 에러가 아니면 unknown이다', () => {
    expect(classifyApiError(new Error('boom')).kind).toBe(
      API_ERROR_KIND.UNKNOWN
    );
    expect(classifyApiError(null).kind).toBe(API_ERROR_KIND.UNKNOWN);
  });

  it('타임아웃 코드는 timeout이다', () => {
    expect(classifyApiError(axiosError({ code: 'ECONNABORTED' })).kind).toBe(
      API_ERROR_KIND.TIMEOUT
    );
    expect(classifyApiError(axiosError({ code: 'ETIMEDOUT' })).kind).toBe(
      API_ERROR_KIND.TIMEOUT
    );
  });

  it('응답이 없으면 network다', () => {
    expect(classifyApiError(axiosError({})).kind).toBe(API_ERROR_KIND.NETWORK);
  });

  it('5xx는 server, 4xx는 client다', () => {
    expect(
      classifyApiError(axiosError({ response: { status: 500 } })).kind
    ).toBe(API_ERROR_KIND.SERVER);
    expect(
      classifyApiError(axiosError({ response: { status: 404 } })).kind
    ).toBe(API_ERROR_KIND.CLIENT);
  });
});

describe('classifyApiError — 부가 정보', () => {
  it('method와 정규화된 경로를 담는다', () => {
    const info = classifyApiError(
      axiosError({
        config: { method: 'post', url: '/api/v1/banners/12' },
        response: { status: 500 },
      })
    );

    expect(info.method).toBe('POST');
    expect(info.routePattern).toBe('/api/v1/banners/:id');
  });

  it('서버 비즈니스 에러 코드를 꺼낸다', () => {
    const info = classifyApiError(
      axiosError({ response: { status: 500, data: { code: 50013 } } })
    );

    expect(info.status).toBe(500);
    expect(info.code).toBe(50013);
  });

  it('응답 바디가 없거나 code가 숫자가 아니면 code는 undefined다', () => {
    expect(
      classifyApiError(axiosError({ response: { status: 500 } })).code
    ).toBeUndefined();
    expect(
      classifyApiError(
        axiosError({ response: { status: 500, data: { code: 'X' } } })
      ).code
    ).toBeUndefined();
  });
});
