import { describe, expect, it } from 'vitest';

import {
  isInjectedScriptEvent,
  NOISE_DENY_URLS,
  NOISE_ERROR_PATTERNS,
} from './noiseFilter';

import type { ErrorEvent } from '@sentry/react';

const matchesNoise = (message: string) =>
  NOISE_ERROR_PATTERNS.some((pattern) => pattern.test(message));

const matchesDenyUrl = (url: string) =>
  NOISE_DENY_URLS.some((pattern) => pattern.test(url));

/**
 * 프레임을 실제 전송 시점 모양으로 만든다.
 *
 * `in_app: true`를 모든 프레임에 붙이는 이유는 `@sentry/browser`가 실제로 그렇게 만들기
 * 때문이다. 이전 테스트는 `in_app: false`인 프레임을 만들어 검증했는데, SDK가 그런 프레임을
 * 만들지 않으므로 실제로는 발생할 수 없는 입력이었다.
 */
const eventWithFilenames = (filenames: (string | undefined)[]): ErrorEvent =>
  ({
    exception: {
      values: [
        {
          stacktrace: {
            frames: filenames.map((filename) => ({ filename, in_app: true })),
          },
        },
      ],
    },
  }) as unknown as ErrorEvent;

describe('NOISE_ERROR_PATTERNS', () => {
  it('인스타 인앱브라우저가 끼워 넣은 스크립트의 에러를 걸러낸다', () => {
    expect(
      matchesNoise(
        "undefined is not an object (evaluating 'window.webkit.messageHandlers')"
      )
    ).toBe(true);
    expect(
      matchesNoise('Error invoking postMessage: Java object is gone')
    ).toBe(true);
  });

  it('브라우저·서드파티 내부 노이즈를 걸러낸다', () => {
    expect(matchesNoise('AbortError: AbortError')).toBe(true);
    expect(
      matchesNoise(
        'InvalidStateError: Failed to execute transaction: The database connection is closing.'
      )
    ).toBe(true);
    expect(
      matchesNoise('UnknownError: Database deleted by request of the user')
    ).toBe(true);
    expect(matchesNoise('ResizeObserver loop limit exceeded')).toBe(true);
  });

  it('앱에서 나는 진짜 에러는 걸러내지 않는다', () => {
    expect(matchesNoise('TypeError: Cannot read properties of undefined')).toBe(
      false
    );
    expect(
      matchesNoise(
        'Error: Invalid blocker state transition: unblocked -> proceeding'
      )
    ).toBe(false);
    expect(matchesNoise('Request failed with status code 500')).toBe(false);
  });
});

describe('NOISE_DENY_URLS', () => {
  // HOUME-CLIENT-N의 실제 프레임 주소
  it('인스타 안드로이드 인앱브라우저의 iabjs:// 주소를 차단한다', () => {
    expect(
      matchesDenyUrl('iabjs://navigation_performance_logger_android:1:10155')
    ).toBe(true);
  });

  it('브라우저 확장 프로그램 주소를 차단한다', () => {
    expect(matchesDenyUrl('chrome-extension://abcdef/inject.js')).toBe(true);
    expect(matchesDenyUrl('moz-extension://abcdef/inject.js')).toBe(true);
  });

  it('하우미 자산 주소는 차단하지 않는다', () => {
    expect(
      matchesDenyUrl('https://www.houme.kr/assets/index-BjN1JfgV.js')
    ).toBe(false);
  });
});

describe('isInjectedScriptEvent', () => {
  // HOUME-CLIENT-F의 실제 스택 — 세 프레임 모두 HTML 문서 경로
  it('인스타 iOS가 문서에 직접 넣은 스크립트를 잡아낸다', () => {
    expect(
      isInjectedScriptEvent(
        eventWithFilenames(['/landing', '/landing', '/landing'])
      )
    ).toBe(true);
  });

  it('절대 주소 형태의 문서 경로도 잡아낸다', () => {
    expect(
      isInjectedScriptEvent(
        eventWithFilenames(['https://www.houme.kr/landing'])
      )
    ).toBe(true);
  });

  it('하우미 빌드 결과(.js)는 잡지 않는다', () => {
    expect(
      isInjectedScriptEvent(
        eventWithFilenames([
          'https://www.houme.kr/assets/index-BjN1JfgV.js',
          'https://www.houme.kr/assets/MyPage-C9macM4-.js',
        ])
      )
    ).toBe(false);
  });

  // HOUME-CLIENT-N의 실제 스택 — iabjs 3개 + @sentry/browser 1개
  it('.js 프레임이 하나라도 섞여 있으면 잡지 않는다 (이 경우는 denyUrls가 담당)', () => {
    expect(
      isInjectedScriptEvent(
        eventWithFilenames([
          'iabjs://navigation_performance_logger_android',
          'iabjs://navigation_performance_logger_android',
          'iabjs://navigation_performance_logger_android',
          '../../node_modules/.pnpm/@sentry+browser@10.63.0/node_modules/@sentry/browser/build/npm/esm/prod/helpers.js',
        ])
      )
    ).toBe(false);
  });

  it('모든 프레임이 in_app: true여도 파일명으로 판별한다', () => {
    // 이전 구현이 in_app으로 판별해 아무것도 잡지 못했던 회귀를 막는다
    const event = eventWithFilenames(['/landing']);
    const frames = event.exception?.values?.[0]?.stacktrace?.frames ?? [];

    expect(frames.every((frame) => frame.in_app === true)).toBe(true);
    expect(isInjectedScriptEvent(event)).toBe(true);
  });

  it('파일명을 모르거나 스택이 없으면 잡지 않는다', () => {
    expect(isInjectedScriptEvent(eventWithFilenames([undefined]))).toBe(false);
    expect(isInjectedScriptEvent(eventWithFilenames([]))).toBe(false);
    expect(isInjectedScriptEvent({} as ErrorEvent)).toBe(false);
  });
});
