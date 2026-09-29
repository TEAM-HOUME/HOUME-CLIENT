import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve } from 'node:path';

import {
  APP_ORIGIN,
  GENERATE_PATH,
  createResponses,
  imagePath,
  success,
} from './responses';

import type { MockReply } from './responses';
import type { BrowserContext, Route } from '@playwright/test';

export interface Exchange {
  method: string;
  path: string;
  origin: string;
  body: unknown;
  disposition: 'mock-fulfilled' | 'local-continued' | 'blocked';
}
export class MissingMockError extends Error {
  override name = 'MissingMockError';
}
function assetPaths(directory: string): Set<string> {
  const root = resolve(directory);
  const paths = new Set<string>();
  function visit(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) visit(path);
      else paths.add('/' + relative(root, path));
    }
  }
  visit(root);
  return paths;
}
export class HttpMockController {
  readonly responses: Record<string, MockReply>;
  readonly journal: Exchange[] = [];
  readonly violations: string[] = [];
  readonly counts = new Map<string, number>();
  readonly failure: Promise<never>;
  private fail!: (error: Error) => void;
  private readonly localAssets: Set<string>;
  private readonly pending = new Set<() => void>();
  private generationReply: MockReply | undefined;
  private disposed = false;
  readonly generated: Promise<void>;
  private sawGeneration!: () => void;

  readonly variant: 'A' | 'B';
  readonly missingGenerate: boolean;
  constructor(
    variant: 'A' | 'B' = 'A',
    missingGenerate = false,
    assets?: Set<string>
  ) {
    this.variant = variant;
    this.missingGenerate = missingGenerate;
    this.responses = createResponses(variant);
    this.localAssets = assets ?? assetPaths('test-results/image-flow/build');
    this.failure = new Promise<never>((_, reject) => {
      this.fail = reject;
    });
    // race 연결 전 rejection도 보존하고 teardown에서 같은 원인을 보고한다.
    this.failure.catch(() => undefined);
    this.generated = new Promise((resolve) => {
      this.sawGeneration = resolve;
    });
  }
  get generationCount() {
    return this.counts.get('POST ' + GENERATE_PATH) ?? 0;
  }
  get pendingCount() {
    return this.pending.size;
  }
  private violation(message: string) {
    this.violations.push(message);
    this.fail(new MissingMockError(message));
  }
  async install(context: BrowserContext) {
    await context.route('**/*', (route) => this.dispatch(route));
    await context.routeWebSocket('**/*', (socket) => {
      const url = new URL(socket.url());
      this.violation('MissingMockError WEBSOCKET ' + url.origin + url.pathname);
      socket.close();
    });
  }
  async dispatch(
    route: Pick<Route, 'request' | 'fulfill' | 'abort' | 'continue'>
  ) {
    const request = route.request();
    const url = new URL(request.url());
    url.searchParams.sort();
    const path = url.pathname + url.search;
    const method = request.method();
    const key = method + ' ' + path;
    this.counts.set(key, (this.counts.get(key) ?? 0) + 1);
    const rawBody = request.postData();
    let body: unknown = rawBody;
    if (rawBody) {
      try {
        body = JSON.parse(rawBody);
      } catch {
        body = rawBody;
      } // JSON이 깨졌어도 journal·abort·실패 signal까지 실행한다.
    }
    const entry: Exchange = {
      method,
      path,
      origin: url.origin,
      body,
      disposition: 'blocked',
    };
    this.journal.push(entry);
    // 앱이 사용하는 애니메이션 엔진 파일도 외부 전송 없이 설치된 동일 버전으로 제공한다.
    const wasmUrls = [
      'https://cdn.jsdelivr.net/npm/@lottiefiles/dotlottie-web@0.76.0/dist/dotlottie-player.wasm',
      'https://unpkg.com/@lottiefiles/dotlottie-web@0.76.0/dist/dotlottie-player.wasm',
    ];
    if (method === 'GET' && wasmUrls.includes(url.href)) {
      const require = createRequire(import.meta.url);
      const lottieRequire = createRequire(
        require.resolve('@lottiefiles/dotlottie-react')
      );
      const wasm = join(
        dirname(lottieRequire.resolve('@lottiefiles/dotlottie-web')),
        'dotlottie-player.wasm'
      );
      entry.disposition = 'mock-fulfilled';
      await route.fulfill({
        status: 200,
        contentType: 'application/wasm',
        body: readFileSync(wasm),
      });
      return;
    }
    if (
      url.origin === APP_ORIGIN &&
      method === 'POST' &&
      path === GENERATE_PATH &&
      !this.missingGenerate
    ) {
      this.sawGeneration();
      await new Promise<void>((resolve) => {
        if (this.generationReply || this.disposed) resolve();
        else this.pending.add(resolve);
      });
      if (this.disposed) {
        await route.abort();
        return;
      }
      entry.disposition = 'mock-fulfilled';
      await this.fulfill(route, this.generationReply!);
      return;
    }
    const reply = url.origin === APP_ORIGIN ? this.responses[key] : undefined;
    if (reply) {
      entry.disposition = 'mock-fulfilled';
      await this.fulfill(route, reply);
      return;
    }
    const images = [
      'plan701',
      'plan702',
      'view-a',
      'view-b',
      'view-z',
      'mood-87',
      'mood-305',
      'mood-21',
      'mood-98',
      'carousel',
      'result9001',
      'result9002',
    ];
    const image = images.find((name) => imagePath(name) === path);
    if (url.origin === APP_ORIGIN && method === 'GET' && image) {
      entry.disposition = 'mock-fulfilled';
      await route.fulfill({
        status: 200,
        contentType: 'image/svg+xml',
        body: readFileSync(resolve('e2e/fixtures/images', image + '.svg')),
      });
      return;
    }
    const navigation =
      request.isNavigationRequest() &&
      ['/', '/imageSetup', '/generate', '/generate/result'].includes(
        url.pathname
      );
    if (
      url.origin === APP_ORIGIN &&
      ['GET', 'HEAD'].includes(method) &&
      (navigation || (!url.search && this.localAssets.has(url.pathname)))
    ) {
      entry.disposition = 'local-continued';
      await route.continue();
      return;
    }
    const message = 'MissingMockError ' + method + ' ' + path;
    this.violation(message);
    await route.abort('blockedbyclient');
  }
  private async fulfill(route: Pick<Route, 'fulfill'>, reply: MockReply) {
    await route.fulfill({
      status: reply.status,
      contentType: 'application/json',
      body: JSON.stringify({
        code: reply.status === 200 ? 20000 : 50017,
        msg: '테스트 응답',
        data: reply.data,
      }),
    });
  }
  release(outcome: 'success' | 'failure', mirror = false) {
    const id = this.variant === 'A' ? 9001 : 9002;
    this.generationReply =
      outcome === 'success'
        ? success({
            imageId: id,
            imageUrl: imagePath('result' + id),
            isMirror: mirror,
          })
        : { status: 500, data: null };
    for (const resume of this.pending) resume();
    this.pending.clear();
  }
  cancel() {
    this.disposed = true;
    for (const resume of this.pending) resume();
    this.pending.clear();
  }
}
