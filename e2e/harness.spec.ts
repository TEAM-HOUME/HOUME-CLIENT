import { test, expect } from '@playwright/test';

import {
  createBrowserSession,
  SYNTHETIC_AUTH,
} from './fixtures/browserSession';
import { HttpMockController } from './fixtures/httpMock';
import { assertGenerateRequest } from './fixtures/scenarioAssertions';

import type { Browser, BrowserContext, Page, Route } from '@playwright/test';

test('독립 expected 비교와 잘못된 ID 검출', () => {
  const expected = {
    floorPlanId: 701,
    floorPlanView: 'view-b',
    isMirror: true,
    moodBoardIds: [21, 87],
    activity: 'HOME_CAFE',
    furnitureIds: [901, 903],
  };
  assertGenerateRequest({ ...expected, moodBoardIds: [87, 21] }, expected);
  for (const patch of [
    { moodBoardIds: [0, 1] },
    { moodBoardIds: [21] },
    { moodBoardIds: [21, 87, 305] },
    { floorPlanView: 'view-a' },
    { isMirror: 'true' },
  ]) {
    expect(() =>
      assertGenerateRequest({ ...expected, ...patch }, expected)
    ).toThrow();
  }
});
test('새 session은 요청 통제·인증·clock을 준비하고 종료한다', async () => {
  const events: string[] = [];
  let authArgument: unknown;
  const page = {
    setDefaultTimeout() {},
    setDefaultNavigationTimeout() {},
    clock: {
      install: () => {
        events.push('clock');
        return Promise.resolve();
      },
    },
    on() {},
  } as unknown as Page;
  const context = {
    storageState: () => {
      events.push('empty-state');
      return Promise.resolve({ cookies: [], origins: [] });
    },
    route: () => {
      events.push('http');
      return Promise.resolve();
    },
    routeWebSocket: () => {
      events.push('websocket');
      return Promise.resolve();
    },
    addInitScript: (_script: unknown, argument: unknown) => {
      authArgument = argument;
      events.push('auth');
      return Promise.resolve();
    },
    tracing: { start: () => Promise.resolve(), stop: () => Promise.resolve() },
    newPage: () => {
      events.push('page');
      return Promise.resolve(page);
    },
    close: () => {
      events.push('close');
      return Promise.resolve();
    },
    browser: () => ({ version: () => 'test-double' }),
  } as unknown as BrowserContext;
  const browser = {
    newContext: (options: unknown) => {
      expect(options).toEqual({
        viewport: { width: 390, height: 844 },
        serviceWorkers: 'block',
      });
      events.push('new-context');
      return Promise.resolve(context);
    },
  } as Pick<Browser, 'newContext'>;
  const controller = new HttpMockController('A', false, new Set());
  const session = await createBrowserSession(
    browser,
    {
      title: 'session 준비',
      status: 'passed',
      attach: () => Promise.resolve(),
      outputPath: (...parts) => parts.join('/'),
    },
    'A',
    controller
  );
  expect(authArgument).toEqual({
    origin: 'http://127.0.0.1:4173',
    auth: {
      accessToken: 'e2e-token',
      userName: '회귀테스트',
      userId: '2002',
      ab_test_variant: 'B',
    },
  });
  expect(Object.keys(SYNTHETIC_AUTH).sort()).toEqual([
    'ab_test_variant',
    'accessToken',
    'userId',
    'userName',
  ]);
  expect(events).toEqual([
    'new-context',
    'empty-state',
    'http',
    'websocket',
    'auth',
    'page',
    'clock',
  ]);
  await session.dispose();
  expect(events.at(-1)).toBe('close');
  expect(controller.pendingCount).toBe(0);
});
test('등록 GET 응답과 미등록 HTTP 차단', async () => {
  const controller = new HttpMockController('A', false, new Set());
  const calls: { kind: string; value?: unknown }[] = [];
  function route(
    path: string,
    method = 'GET',
    data: string | null = null
  ): Pick<Route, 'request' | 'fulfill' | 'abort' | 'continue'> {
    return {
      request: () =>
        ({
          url: () => 'http://127.0.0.1:4173' + path,
          method: () => method,
          postData: () => data,
          isNavigationRequest: () => false,
        }) as ReturnType<Route['request']>,
      fulfill: (options) => {
        calls.push({ kind: 'fulfill', value: options });
        return Promise.resolve();
      },
      abort: () => {
        calls.push({ kind: 'abort' });
        return Promise.resolve();
      },
      continue: () => {
        calls.push({ kind: 'continue' });
        return Promise.resolve();
      },
    };
  }
  await controller.dispatch(route('/api/v2/recent-floor-plan'));
  expect(calls).toEqual([
    {
      kind: 'fulfill',
      value: {
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 20000,
          msg: '테스트 응답',
          data: { hasRecentImage: false, floorPlans: [] },
        }),
      },
    },
  ]);
  expect(controller.counts.get('GET /api/v2/recent-floor-plan')).toBe(1);
  expect(controller.journal[0]?.disposition).toBe('mock-fulfilled');
  await controller.dispatch(route('/not-registered'));
  await expect(controller.failure).rejects.toThrow(
    'MissingMockError GET /not-registered'
  );
  expect(calls.map((call) => call.kind)).toEqual(['fulfill', 'abort']);
  expect(controller.journal[1]?.disposition).toBe('blocked');
  const malformed = new HttpMockController('A', false, new Set());
  await malformed.dispatch(route('/unexpected-post', 'POST', 'invalid-json'));
  await expect(malformed.failure).rejects.toThrow(
    'MissingMockError POST /unexpected-post'
  );
  expect(malformed.journal[0]).toMatchObject({
    body: 'invalid-json',
    disposition: 'blocked',
  });
  expect(calls.map((call) => call.kind)).toEqual(['fulfill', 'abort', 'abort']);
});

test('새로고침한 비교 결과는 상단 전체를 하나의 원본 상품 이동 버튼으로 노출한다', async ({
  browser,
}, info) => {
  const session = await createBrowserSession(browser, info);
  const sourceUrl = 'https://shop.example.invalid/product/1';

  try {
    await session.run(async () => {
      await session.page.goto(
        `/?tab=compare&jobId=refresh-job&productUrl=${encodeURIComponent(sourceUrl)}`
      );

      const output = session.page.getByRole('region', { name: '검색한 상품' });
      const externalLinkButton = output.getByRole('button', {
        name: '새로고침 검색 상품 상품 링크로 이동',
      });

      await expect(externalLinkButton).toBeVisible();
      await expect(
        externalLinkButton.getByText('새로고침 검색 상품')
      ).toBeVisible();

      await session.page.evaluate(() => {
        const state = window as Window & { openedProductUrl?: string };
        window.open = (url) => {
          state.openedProductUrl = String(url);
          return null;
        };
      });
      await externalLinkButton.click();
      expect(
        await session.page.evaluate(
          () =>
            (window as Window & { openedProductUrl?: string }).openedProductUrl
        )
      ).toBe(sourceUrl);
    });
  } finally {
    await session.dispose();
  }
});
