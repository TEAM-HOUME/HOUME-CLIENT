import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// 외부 의존성 모킹 (실제 모듈 동작과 독립적으로 로직만 검증)
vi.mock('sonner', () => ({ toast: { custom: vi.fn() } }));
vi.mock('@routes/paths', () => ({ ROUTES: { LOGIN: '/login' } }));
vi.mock('@shared/types/toast', () => ({
  TOAST_TYPE: { ERROR: 'error' },
  TOASTER_ID: { BOTTOM_4: 'bottom-4' },
}));
vi.mock('@components/v2/toast/Toast', () => ({ default: vi.fn() }));
vi.mock('@components/v2/toast/Toast.css', () => ({ toastStyle: {} }));
vi.mock('@/routes/router', () => ({ router: { navigate: vi.fn() } }));
// Sentry 전송 자체는 report 모듈이 담당하므로 여기서는 호출 여부만 검증
vi.mock('@shared/monitoring/report', () => ({
  reportError: vi.fn(),
  reportMessage: vi.fn(),
  addReportBreadcrumb: vi.fn(),
}));

import {
  handleGlobalError,
  handleMutationError,
  handleQueryError,
} from './globalErrorHandler';

import type { Mutation, Query } from '@tanstack/react-query';

/** 테스트용 AxiosError 형태 (axios는 isAxiosError 플래그로 판별한다) */
const axiosError = (status: number, code?: number) => ({
  isAxiosError: true,
  config: { method: 'get', url: '/api/v1/x' },
  response: { status, data: code === undefined ? undefined : { code } },
});

const fakeQuery = (meta?: unknown) =>
  ({
    meta,
    queryKey: ['product', 'productList', { keyword: '검색어' }],
  }) as unknown as Query<unknown, unknown, unknown>;

const fakeMutation = (meta?: unknown) =>
  ({
    options: { meta, mutationKey: ['generate', 'fullFunnel'] },
  }) as unknown as Mutation<unknown, unknown, unknown>;

// isSessionExpiredError 자체의 판별 테스트는 정의가 있는 classifyApiError.test.ts에 둔다

describe('handleGlobalError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, '', '/');
  });

  it('쿼리 실패의 네트워크 에러는 전역 toast를 호출하지 않는다', async () => {
    const { toast } = await import('sonner');

    handleGlobalError(new Error('Network Error'));

    expect(toast.custom).not.toHaveBeenCalled();
  });

  it('이미지 생성 예외 코드는 LoadingPage에서만 처리하도록 전역 toast를 호출하지 않는다', async () => {
    const { toast } = await import('sonner');

    handleGlobalError(axiosError(500, 50013));

    expect(toast.custom).not.toHaveBeenCalled();
  });

  it('SESSION_EXPIRED 에러는 v2 sonner toast를 호출한다', async () => {
    const { toast } = await import('sonner');

    handleGlobalError(new Error('SESSION_EXPIRED'));

    expect(toast.custom).toHaveBeenCalledTimes(1);
  });
});

describe('handleQueryError — Sentry 전송', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 5xx는 20% 샘플링이라 확률에 따라 결과가 흔들린다.
    // 이 파일은 "정책 결과가 전송으로 연결되는가"를 보는 것이므로 샘플은 항상 통과시킨다.
    // (샘플링 비율 자체는 apiReportPolicy.test.ts에서 검증)
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('5xx는 Sentry로 전송한다', async () => {
    const { reportError } = await import('@shared/monitoring/report');

    handleQueryError(axiosError(500), fakeQuery());

    expect(reportError).toHaveBeenCalledTimes(1);
  });

  it('404는 전송하지 않는다 (4xx는 allowlist만)', async () => {
    const { reportError } = await import('@shared/monitoring/report');

    handleQueryError(axiosError(404), fakeQuery());

    expect(reportError).not.toHaveBeenCalled();
  });

  it('SESSION_EXPIRED는 전송하지 않는다', async () => {
    const { reportError } = await import('@shared/monitoring/report');

    handleQueryError(new Error('SESSION_EXPIRED'), fakeQuery());

    expect(reportError).not.toHaveBeenCalled();
  });

  it('meta.sentry.capture가 never면 5xx도 전송하지 않는다', async () => {
    const { reportError } = await import('@shared/monitoring/report');

    handleQueryError(
      axiosError(500),
      fakeQuery({ sentry: { scope: 'api', capture: 'never' } })
    );

    expect(reportError).not.toHaveBeenCalled();
  });

  it('전송하지 않는 실패도 breadcrumb는 남긴다', async () => {
    const { addReportBreadcrumb } = await import('@shared/monitoring/report');

    handleQueryError(axiosError(404), fakeQuery());

    expect(addReportBreadcrumb).toHaveBeenCalledTimes(1);
  });

  // queryKey 세 번째 자리에는 필터·cursor를 담은 객체가 통째로 들어가고,
  // 앞으로 무엇이 추가될지 모른다. 그래서 앞 2개 세그먼트만 쓴다.
  // (검색어 자체는 개인정보가 아니라 GA breadcrumb으로는 원문이 실린다)
  it('queryKey는 앞 2개 세그먼트만 컨텍스트에 담는다', async () => {
    const { reportError } = await import('@shared/monitoring/report');

    handleQueryError(axiosError(500), fakeQuery());

    const serialized = JSON.stringify(vi.mocked(reportError).mock.calls[0][1]);
    expect(serialized).toContain('product.productList');
    expect(serialized).not.toContain('검색어');
  });
});

describe('handleMutationError — Sentry 전송', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('meta.sentry.capture가 always면 4xx도 전송한다', async () => {
    const { reportError } = await import('@shared/monitoring/report');

    handleMutationError(
      axiosError(400),
      undefined,
      undefined,
      fakeMutation({ sentry: { scope: 'imageGenerate', capture: 'always' } })
    );

    expect(reportError).toHaveBeenCalledTimes(1);
  });

  it('meta의 scope를 전송 옵션에 반영한다', async () => {
    const { reportError } = await import('@shared/monitoring/report');

    handleMutationError(
      axiosError(500),
      undefined,
      undefined,
      fakeMutation({ sentry: { scope: 'imageGenerate' } })
    );

    expect(vi.mocked(reportError).mock.calls[0][1]).toMatchObject({
      scope: 'imageGenerate',
    });
  });
});
