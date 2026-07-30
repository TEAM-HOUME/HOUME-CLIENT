import { afterEach, describe, expect, it, vi } from 'vitest';

import { decideApiReport } from './apiReportPolicy';
import { API_ERROR_KIND, type ApiErrorInfo } from './classifyApiError';

const info = (overrides: Partial<ApiErrorInfo>): ApiErrorInfo => ({
  kind: API_ERROR_KIND.SERVER,
  method: 'GET',
  routePattern: '/api/v1/x',
  ...overrides,
});

const auto = { isMutation: false, captureMode: 'auto' as const };

afterEach(() => {
  vi.restoreAllMocks();
});

describe('decideApiReport — 전송하는 것', () => {
  it('5xx는 error로 전송한다', () => {
    const decision = decideApiReport(
      info({ kind: API_ERROR_KIND.SERVER, status: 500 }),
      auto
    );

    expect(decision?.level).toBe('error');
  });

  it('타임아웃과 unknown도 전송한다', () => {
    expect(
      decideApiReport(info({ kind: API_ERROR_KIND.TIMEOUT }), auto)
    ).not.toBeNull();
    expect(
      decideApiReport(info({ kind: API_ERROR_KIND.UNKNOWN }), auto)
    ).not.toBeNull();
  });

  it('allowlist에 있는 4xx 비즈니스 코드는 전송한다', () => {
    const decision = decideApiReport(
      info({ kind: API_ERROR_KIND.CLIENT, status: 400, code: 50400 }),
      auto
    );

    expect(decision?.level).toBe('error');
  });

  it('fingerprint에 경로·상태·코드가 들어간다', () => {
    const decision = decideApiReport(
      info({ status: 500, code: 50013, routePattern: '/api/v1/gen' }),
      auto
    );

    expect(decision?.fingerprint).toEqual([
      'api',
      API_ERROR_KIND.SERVER,
      'GET',
      '/api/v1/gen',
      '500',
      '50013',
    ]);
  });
});

describe('decideApiReport — 전송하지 않는 것', () => {
  it('SESSION_EXPIRED와 취소는 어떤 모드에서도 보내지 않는다', () => {
    expect(
      decideApiReport(info({ kind: API_ERROR_KIND.SESSION_EXPIRED }), auto)
    ).toBeNull();
    expect(
      decideApiReport(info({ kind: API_ERROR_KIND.CANCELED }), {
        isMutation: false,
        captureMode: 'always',
      })
    ).toBeNull();
  });

  it('allowlist에 없는 4xx는 보내지 않는다 (404·409·429)', () => {
    [404, 409, 429].forEach((status) => {
      expect(
        decideApiReport(info({ kind: API_ERROR_KIND.CLIENT, status }), auto)
      ).toBeNull();
    });
  });

  it('크레딧 초과(42900)처럼 정상 비즈니스 코드는 보내지 않는다', () => {
    expect(
      decideApiReport(
        info({ kind: API_ERROR_KIND.CLIENT, status: 429, code: 42900 }),
        auto
      )
    ).toBeNull();
  });

  it('capture: never면 5xx도 보내지 않는다', () => {
    expect(
      decideApiReport(info({ kind: API_ERROR_KIND.SERVER, status: 500 }), {
        isMutation: false,
        captureMode: 'never',
      })
    ).toBeNull();
  });
});

describe('decideApiReport — 샘플링', () => {
  it('네트워크 에러는 조회일 때 샘플링한다', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);

    expect(
      decideApiReport(info({ kind: API_ERROR_KIND.NETWORK }), auto)
    ).toBeNull();
  });

  it('네트워크 에러라도 변경 요청이면 전량 전송한다', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);

    expect(
      decideApiReport(info({ kind: API_ERROR_KIND.NETWORK }), {
        isMutation: true,
        captureMode: 'auto',
      })
    ).not.toBeNull();
  });

  it('401/403은 샘플에 걸릴 때만 전송한다', () => {
    const authError = info({ kind: API_ERROR_KIND.CLIENT, status: 401 });

    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    expect(decideApiReport(authError, auto)).toBeNull();

    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(decideApiReport(authError, auto)?.level).toBe('warning');
  });

  it('capture: always면 4xx도 전송한다', () => {
    const decision = decideApiReport(
      info({ kind: API_ERROR_KIND.CLIENT, status: 404 }),
      { isMutation: true, captureMode: 'always' }
    );

    expect(decision?.level).toBe('error');
  });
});
