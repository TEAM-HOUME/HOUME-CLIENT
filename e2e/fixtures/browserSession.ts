import { expect } from '@playwright/test';

import { HttpMockController } from './httpMock';
import { APP_ORIGIN } from './responses';

import type { Browser, BrowserContext, Page, TestInfo } from '@playwright/test';

export const SYNTHETIC_AUTH = {
  accessToken: 'e2e-token',
  userName: '회귀테스트',
  userId: '2002',
  ab_test_variant: 'B',
};
export async function createBrowserSession(
  browser: Pick<Browser, 'newContext'>,
  info: Pick<TestInfo, 'attach' | 'outputPath' | 'status' | 'title'>,
  variant: 'A' | 'B' = 'A',
  controller = new HttpMockController(
    variant,
    process.env['E2E_MISSING_GENERATE'] === '1'
  )
) {
  const started = performance.now();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    serviceWorkers: 'block',
  });
  try {
    expect(await context.storageState(), '인증 주입 전 새 context').toEqual({
      cookies: [],
      origins: [],
    });
    await controller.install(context);
    await context.addInitScript(
      ({ origin, auth }) => {
        if (location.origin === origin)
          for (const [key, value] of Object.entries(auth))
            localStorage.setItem(key, value);
      },
      { origin: APP_ORIGIN, auth: SYNTHETIC_AUTH }
    );
    await context.tracing.start({
      screenshots: true,
      snapshots: true,
      sources: true,
    });
    const page = await context.newPage();
    page.setDefaultTimeout(5_000);
    page.setDefaultNavigationTimeout(15_000);
    await page.clock.install();
    const history: string[] = [];
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) history.push(frame.url());
    });
    return new BrowserTestSession(
      context,
      page,
      controller,
      info,
      history,
      started
    );
  } catch (error) {
    controller.cancel();
    await context.close();
    throw error;
  }
}
export class BrowserTestSession {
  readonly context: BrowserContext;
  readonly page: Page;
  readonly http: HttpMockController;
  readonly history: string[];
  private readonly info: Pick<
    TestInfo,
    'attach' | 'outputPath' | 'status' | 'title'
  >;
  private readonly started: number;
  private failed = false;
  constructor(
    context: BrowserContext,
    page: Page,
    http: HttpMockController,
    info: Pick<TestInfo, 'attach' | 'outputPath' | 'status' | 'title'>,
    history: string[],
    started: number
  ) {
    this.context = context;
    this.page = page;
    this.http = http;
    this.info = info;
    this.history = history;
    this.started = started;
  }
  async run<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await Promise.race([operation(), this.http.failure]);
    } catch (error) {
      this.failed = true;
      throw error;
    }
  }
  async pauseAfterPost() {
    await Promise.race([this.http.generated, this.http.failure]);
    const now = await this.page.evaluate(() => Date.now());
    await this.page.clock.pauseAt(now + 100);
  }
  async dispose() {
    this.http.cancel();
    try {
      const evidence = {
        scenario: this.info.title,
        durationMs: performance.now() - this.started,
        generationPostCount: this.http.generationCount,
        pendingAfterCancel: this.http.pendingCount,
        journal: this.http.journal,
        violations: this.http.violations,
        history: this.history,
        browserVersion: this.context.browser()?.version(),
        retries: 0,
        humanInteractionDuringRunMs: 0,
        networkObservation:
          '앱 browser 요청의 fulfill/abort/로컬 continue 기록. OS 전체 egress와 실제 서버·이미지 품질은 미검증.',
      };
      await this.info.attach('request-journal', {
        body: JSON.stringify(evidence, null, 2),
        contentType: 'application/json',
      });
      if (
        this.failed ||
        this.info.status !== 'passed' ||
        this.http.violations.length > 0
      ) {
        const screenshot = this.info.outputPath('failure.png');
        await this.page.screenshot({
          path: screenshot,
          fullPage: true,
          timeout: 5_000,
        });
        await this.info.attach('failure', {
          path: screenshot,
          contentType: 'image/png',
        });
        const trace = this.info.outputPath('trace.zip');
        await this.context.tracing.stop({ path: trace });
        await this.info.attach('trace', {
          path: trace,
          contentType: 'application/zip',
        });
      } else await this.context.tracing.stop();
    } finally {
      await this.context.close();
    }
    if (!this.failed)
      expect(this.http.violations, '미등록 요청은 실패').toEqual([]);
  }
}
