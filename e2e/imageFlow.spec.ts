import { test, expect } from '@playwright/test';

import { createBrowserSession } from './fixtures/browserSession';
import { createResponses } from './fixtures/responses';
import { assertGenerateRequest } from './fixtures/scenarioAssertions';

import type { BrowserTestSession } from './fixtures/browserSession';

// expected는 기능 명세를 기준으로 직접 적고, ID는 합성 값을 쓴다. expected를 production 코드로 계산하지 않는다.
async function selectFunnel(
  session: BrowserTestSession,
  options: {
    floor?: number;
    moods: number[];
    alternate?: boolean;
    homeReady?: boolean;
  }
) {
  const { page } = session;
  if (!options.homeReady) await page.goto('/');
  await page
    .locator('nav')
    .getByRole('button', { name: /AI로 집 꾸미기/ })
    .click();
  await expect(page).toHaveURL(/\/imageSetup/);
  await page
    .getByText('테스트 도면 ' + (options.floor ?? 701), { exact: true })
    .click();
  if (options.alternate) {
    await page.getByRole('button', { name: '다음', exact: true }).click();
    await expect(page.getByText('view-b', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: /좌우반전/ }).click();
  }
  await page
    .getByRole('button', { name: '공간 선택하기', exact: true })
    .click();
  for (const id of options.moods)
    await page.locator('img[src="/__e2e/images/mood-' + id + '.svg"]').click();
  await page.getByRole('button', { name: '다음', exact: true }).click();
  await page.getByRole('button', { name: /활동 형태를 선택해주세요/ }).click();
  await page.getByRole('button', { name: /홈카페형/ }).click();
  await page.getByRole('button', { name: '선택하기', exact: true }).click();
  await expect(
    page.locator('button[aria-pressed]').filter({ hasText: '테스트 티테이블' }),
    '필수 가구 자동 선택'
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '테스트 조명', exact: true }).click();
  await expect(
    page.getByRole('button', { name: '선택하지 않을 조명', exact: true })
  ).toHaveAttribute('aria-pressed', 'false');
  await page
    .getByRole('button', { name: '이미지 생성하기', exact: true })
    .click();
  await session.pauseAfterPost();
}
function generationBody(session: BrowserTestSession) {
  const request = session.http.journal.find(
    (item) =>
      item.method === 'POST' &&
      item.path === '/api/v4/generated-images/generate'
  );
  expect(request, '실제 POST 도달').toBeDefined();
  expect(request!.origin).toBe('http://127.0.0.1:4173');
  return request!.body;
}
async function expectResult(session: BrowserTestSession, id: number) {
  for (
    let i = 0;
    i < 24 && !session.page.url().includes('/generate/result');
    i++
  ) {
    await session.page.clock.runFor(500);
    await session.page.evaluate(() => undefined);
  }
  await expect(session.page).toHaveURL(
    new RegExp('/generate/result\\?houseId=' + id + '(?:&|$)')
  );
  const image = session.page.locator(
    'img[src="/__e2e/images/result' + id + '.svg"]'
  );
  await expect(image).toBeVisible();
  await expect
    .poll(() =>
      image.evaluate((node: HTMLImageElement) => ({
        src: node.currentSrc,
        complete: node.complete,
        width: node.naturalWidth,
        height: node.naturalHeight,
      }))
    )
    .toEqual({
      src: 'http://127.0.0.1:4173/__e2e/images/result' + id + '.svg',
      complete: true,
      width: 640,
      height: 480,
    });
}
test('정상 풀퍼널의 선택값과 성공 이미지', async ({ browser }, info) => {
  const session = await createBrowserSession(browser, info);
  try {
    await session.run(async () => {
      await test.step('홈부터 세 선택 단계', () =>
        selectFunnel(session, { moods: [21] }));
      assertGenerateRequest(generationBody(session), {
        floorPlanId: 701,
        floorPlanView: 'view-a',
        isMirror: false,
        moodBoardIds: [21],
        activity: 'HOME_CAFE',
        furnitureIds: [901, 903],
      });
      // 이 테스트는 정상 연결만 검사한다. 보류 구간의 지속적인 loading 검증은 응답 보류 단계가 담당한다.
      for (let i = 0; i < 30; i++) await session.page.clock.runFor(1000);
      const delivered = session.page.waitForResponse((response) =>
        response.url().endsWith('/api/v4/generated-images/generate')
      );
      session.http.release('success');
      await delivered;
      await test.step('지정 결과 이미지 실제 load', () =>
        expectResult(session, 9001));
    });
  } finally {
    await session.dispose();
  }
});

test('선택 해제·view/반전·응답 보류와 성공', async ({ browser }, info) => {
  const session = await createBrowserSession(browser, info);
  try {
    await session.run(async () => {
      await selectFunnel(session, {
        moods: [305, 21, 87, 305],
        alternate: true,
      });
      const body = generationBody(session);
      await test.step('정확한 선택 ID 집합과 여섯 field', () => {
        assertGenerateRequest(body, {
          floorPlanId: 701,
          floorPlanView: 'view-b',
          isMirror: true,
          moodBoardIds: [21, 87],
          activity: 'HOME_CAFE',
          furnitureIds: [901, 903],
        });
        return Promise.resolve();
      });
      await test.step('두 번째 view와 반전 값', () => {
        expect(body).toMatchObject({
          floorPlanId: 701,
          floorPlanView: 'view-b',
          isMirror: true,
        });
        return Promise.resolve();
      });
      await test.step('응답 보류 30초 전체 구간의 loading·결과 미진입', async () => {
        for (let second = 0; second <= 30; second++) {
          await expect(session.page).toHaveURL(
            'http://127.0.0.1:4173/generate'
          );
          await expect(
            session.page.getByText(
              /새로고침이나 페이지 이탈 시, 이미지 생성이 중단돼요|이미지를 생성하는 중이에요/
            )
          ).toBeVisible();
          expect(
            session.history.filter((url) => url.includes('/generate/result')),
            '조기 결과 이동 이력'
          ).toEqual([]);
          if (second < 30) await session.page.clock.runFor(1000);
        }
      });
      const delivered = session.page.waitForResponse((response) =>
        response.url().endsWith('/api/v4/generated-images/generate')
      );
      session.http.release('success', true);
      await delivered;
      await test.step('응답 해제 후 지정 결과 load', () =>
        expectResult(session, 9001));
    });
  } finally {
    await session.dispose();
  }
});

// 생성 요청은 크레딧을 차감하므로, 실패 후 사용자가 요청하지 않은 재요청이 나가면 안 된다.
test('생성 실패는 toast·홈 복귀·결과 미표시·자동 재요청 0회', async ({
  browser,
}, info) => {
  const session = await createBrowserSession(browser, info);
  try {
    await session.run(async () => {
      await selectFunnel(session, { moods: [21] });
      assertGenerateRequest(generationBody(session), {
        floorPlanId: 701,
        floorPlanView: 'view-a',
        isMirror: false,
        moodBoardIds: [21],
        activity: 'HOME_CAFE',
        furnitureIds: [901, 903],
      });
      const delivered = session.page.waitForResponse((response) =>
        response.url().endsWith('/api/v4/generated-images/generate')
      );
      session.http.release('failure');
      await delivered;
      await expect(session.page).toHaveURL('http://127.0.0.1:4173/');
      // Sonner는 toast mount를 setTimeout(0)로 예약한다. 10초 관찰 전에 현재 시각의 task만 처리한다.
      await session.page.clock.runFor(0);
      await expect(
        session.page.getByText(
          '이미지 생성에 문제가 발생했어요. 잠시 후에 다시 시도해 주세요.',
          { exact: true }
        )
      ).toBeVisible();
      await expect(session.page).toHaveURL('http://127.0.0.1:4173/');
      await expect(
        session.page
          .locator('nav')
          .getByRole('button', { name: /AI로 집 꾸미기/ })
      ).toBeVisible();
      for (let second = 0; second <= 10; second++) {
        await expect(session.page).toHaveURL('http://127.0.0.1:4173/');
        await expect(
          session.page.locator('img[src*="/result9001.svg"]')
        ).toHaveCount(0);
        expect(
          session.history.filter((url) => url.includes('/generate/result')),
          '성공 결과 진입 없음'
        ).toEqual([]);
        expect(session.http.generationCount, '최초 POST 포함 1회').toBe(1);
        if (second < 10) await session.page.clock.runFor(1000);
      }
    });
  } finally {
    await session.dispose();
  }
});

test('오염된 A 이후 B는 클릭 전부터 독립된 상태와 응답을 사용한다', async ({
  browser,
}, info) => {
  const original = createResponses();
  const originalSnapshot = structuredClone(original);
  const a = await createBrowserSession(browser, info);
  try {
    await a.run(async () => {
      await selectFunnel(a, { moods: [21] });
      expect(a.http.generationCount).toBe(1);
      expect(a.http.pendingCount).toBe(1);
      await a.page.evaluate(() => {
        localStorage.setItem('e2e-poison', 'A');
        sessionStorage.setItem('e2e-poison', 'A');
        (window as unknown as Record<string, unknown>)['e2ePoison'] = 'A';
      });
      a.http.responses['GET /api/v2/recent-floor-plan'] = {
        status: 200,
        data: { hasRecentImage: true, poison: 'A' },
      };
    });
  } finally {
    await a.dispose();
  }

  const b = await createBrowserSession(browser, info, 'B');
  try {
    await b.run(async () => {
      expect(b.context).not.toBe(a.context);
      expect(b.page).not.toBe(a.page);
      expect(b.http).not.toBe(a.http);
      expect(b.http.generationCount).toBe(0);
      expect(b.http.pendingCount).toBe(0);
      expect(b.http.journal).toEqual([]);
      expect(original).toEqual(originalSnapshot);
      expect(b.http.responses['GET /api/v2/recent-floor-plan']).toEqual({
        status: 200,
        data: { hasRecentImage: false, floorPlans: [] },
      });
      await b.page.goto('/');
      await expect(
        b.page.locator('nav').getByRole('button', { name: /AI로 집 꾸미기/ })
      ).toBeVisible();
      const beforeClicks = await b.page.evaluate(() => ({
        localPoison: localStorage.getItem('e2e-poison'),
        sessionPoison: sessionStorage.getItem('e2e-poison'),
        windowPoison:
          (window as unknown as Record<string, unknown>)['e2ePoison'] ?? null,
        funnel: sessionStorage.getItem('funnel-store'),
      }));
      expect(beforeClicks).toEqual({
        localPoison: null,
        sessionPoison: null,
        windowPoison: null,
        funnel: null,
      });
      await info.attach('isolation-before-clicks', {
        body: JSON.stringify(beforeClicks),
        contentType: 'application/json',
      });
      await selectFunnel(b, { floor: 702, moods: [98], homeReady: true });
      assertGenerateRequest(generationBody(b), {
        floorPlanId: 702,
        floorPlanView: 'view-z',
        isMirror: false,
        moodBoardIds: [98],
        activity: 'HOME_CAFE',
        furnitureIds: [901, 903],
      });
      for (let second = 0; second < 30; second++)
        await b.page.clock.runFor(1000);
      const delivered = b.page.waitForResponse((response) =>
        response.url().endsWith('/api/v4/generated-images/generate')
      );
      b.http.release('success');
      await delivered;
      await expectResult(b, 9002);
    });
  } finally {
    await b.dispose();
  }
});
