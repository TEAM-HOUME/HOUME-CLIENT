import { describe, expect, it } from 'vitest';

import {
  redactBreadcrumb,
  redactQueryString,
  redactUrl,
  scrubErrorEvent,
} from './scrub';

import type { Breadcrumb, ErrorEvent } from '@sentry/react';

/**
 * 보안 회귀 테스트
 * 카카오 인가코드·검색어가 Sentry로 새어나가지 않는지 확인한다.
 */
describe('redactUrl', () => {
  it('카카오 OAuth 인가코드(code)를 가린다', () => {
    const redacted = redactUrl(
      'https://api.houme.kr/oauth/kakao/callback?code=SECRET_AUTH_CODE&env=prod'
    );

    expect(redacted).not.toContain('SECRET_AUTH_CODE');
    expect(redacted).toContain('[Filtered]');
    // 민감하지 않은 파라미터는 유지돼야 디버깅이 가능하다
    expect(redacted).toContain('env=prod');
  });

  // 가구 검색어는 개인정보가 아니고, 어떤 검색어에서 실패했는지가 원인 파악에 쓰인다.
  // GA 이벤트로도 breadcrumb에 원문이 실리므로 URL에서만 가리면 오해를 부른다.
  it('상품 검색어(keyword)는 가리지 않는다', () => {
    const url = '/api/products?keyword=내검색어&cursor=3';

    expect(redactUrl(url)).toBe(url);
  });

  it('토큰 계열 파라미터를 가린다', () => {
    const redacted = redactUrl(
      'https://api.houme.kr/x?accessToken=aaa&signupToken=bbb'
    );

    expect(redacted).not.toContain('aaa');
    expect(redacted).not.toContain('bbb');
  });

  it('상대 경로도 처리하며 절대 URL로 바꾸지 않는다', () => {
    const redacted = redactUrl('/oauth/kakao/callback?code=SECRET');

    expect(redacted.startsWith('/oauth/kakao/callback')).toBe(true);
    expect(redacted).not.toContain('SECRET');
  });

  it('민감 파라미터가 없으면 원본을 그대로 돌려준다', () => {
    const url = 'https://api.houme.kr/api/v1/banners?size=10';

    expect(redactUrl(url)).toBe(url);
  });

  it('파싱할 수 없는 값이나 빈 문자열에도 예외를 던지지 않는다', () => {
    expect(redactUrl('')).toBe('');
    expect(() => redactUrl('%%%not-a-url%%%')).not.toThrow();
  });
});

describe('redactQueryString', () => {
  it('query string 형태에서도 민감 값을 가린다', () => {
    const redacted = redactQueryString('code=SECRET&env=prod');

    expect(redacted).not.toContain('SECRET');
    expect(redacted).toContain('env=prod');
  });
});

describe('redactBreadcrumb', () => {
  it('xhr breadcrumb의 url을 가린다', () => {
    const breadcrumb: Breadcrumb = {
      category: 'xhr',
      data: { url: '/oauth/kakao/callback?code=SECRET' },
    };

    expect(redactBreadcrumb(breadcrumb).data?.url).not.toContain('SECRET');
  });

  it('navigation breadcrumb의 from/to를 가린다', () => {
    const breadcrumb: Breadcrumb = {
      category: 'navigation',
      data: { from: '/login?code=AAA', to: '/callback?code=BBB' },
    };

    const { data } = redactBreadcrumb(breadcrumb);

    expect(data?.from).not.toContain('AAA');
    expect(data?.to).not.toContain('BBB');
  });

  it('data가 없는 breadcrumb에도 예외를 던지지 않는다', () => {
    expect(() => redactBreadcrumb({ category: 'ui.click' })).not.toThrow();
  });
});

describe('scrubErrorEvent', () => {
  it('Authorization 헤더와 쿠키를 제거하고 URL을 가린다', () => {
    const event = {
      request: {
        url: 'https://api.houme.kr/oauth/kakao/callback?code=SECRET',
        headers: { Authorization: 'Bearer token', 'Content-Type': 'app/json' },
        cookies: { refreshToken: 'secret' },
        query_string: 'code=SECRET',
      },
    } as unknown as ErrorEvent;

    const scrubbed = scrubErrorEvent(event);

    expect(scrubbed.request?.headers?.Authorization).toBeUndefined();
    expect(scrubbed.request?.headers?.['Content-Type']).toBe('app/json');
    expect(scrubbed.request?.cookies).toBeUndefined();
    expect(scrubbed.request?.url).not.toContain('SECRET');
    expect(scrubbed.request?.query_string).not.toContain('SECRET');
  });

  it('request가 없는 이벤트에도 예외를 던지지 않는다', () => {
    expect(() => scrubErrorEvent({} as ErrorEvent)).not.toThrow();
  });
});
