import * as Sentry from '@sentry/react';

import {
  isInjectedScriptEvent,
  NOISE_DENY_URLS,
  NOISE_ERROR_PATTERNS,
} from '@shared/monitoring/noiseFilter';
import { consumeSessionEventBudget } from '@shared/monitoring/sampling';
import { redactBreadcrumb, scrubErrorEvent } from '@shared/monitoring/scrub';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const SENTRY_ENVIRONMENT =
  import.meta.env.VITE_SENTRY_ENVIRONMENT ?? import.meta.env.MODE;
const SENTRY_RELEASE =
  import.meta.env.VITE_SENTRY_RELEASE ?? `houme-client@${__APP_VERSION__}`;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * DEV dry-run 모드
 *
 * 로컬에서도 필터·스크럽 파이프라인을 그대로 실행하되, 실제 Sentry 전송만 차단
 * 무엇이 어떤 태그·fingerprint로 전송될 뻔했는지 콘솔에서 확인할 수 있어
 * `enabled: false`라 아무것도 확인할 수 없던 기존 문제를 해결한다.
 *
 * - 실제 전송까지 확인하려면 `.env.local`에 아래 두 값을 넣는다.
 *   VITE_SENTRY_FORCE_ENABLE=true
 *   VITE_SENTRY_ENVIRONMENT=local-verify
 * - dry-run도 SDK 초기화가 필요하므로 `VITE_SENTRY_DSN`은 설정돼 있어야 한다.
 */
const IS_DRY_RUN =
  import.meta.env.DEV && import.meta.env.VITE_SENTRY_FORCE_ENABLE !== 'true';

/** 전송 직전 최종 파이프라인: 스크럽 → 노이즈 표시 → dry-run/예산 확인 */
function handleBeforeSend(event: Sentry.ErrorEvent): Sentry.ErrorEvent | null {
  const scrubbed = scrubErrorEvent(event);

  // Sentry 스택 트레이스 전체가 .js 파일이 아닌 곳에서 왔으면 인앱브라우저가 끼워 넣은 스크립트일 가능성이 높음
  // 그래도 오탐 여지가 있으므로 에러를 완전히 버리지 않고 표시만 한다(분포 직접 확인 후 에러 로깅 여부 결정)
  if (isInjectedScriptEvent(scrubbed)) {
    scrubbed.tags = { ...scrubbed.tags, noise_candidate: 'true' };
  }

  if (IS_DRY_RUN) {
    console.info('[sentry:dry-run] 전송되지 않음', scrubbed);
    return null;
  }

  // 로깅 폭주 방어 — 세션 상한(SESSION_EVENT_BUDGET)을 넘으면 Sentry에 로그를 더 보내지 않는다
  if (!consumeSessionEventBudget()) return null;

  return scrubbed;
}

/** breadcrumb 수집 직전 필터: console 제거 + URL 스크럽 */
function handleBeforeBreadcrumb(
  breadcrumb: Sentry.Breadcrumb
): Sentry.Breadcrumb | null {
  // console breadcrumb에는 에러 객체·응답 바디가 통째로 실릴 수 있어 수집하지 않는다
  if (breadcrumb.category === 'console') return null;

  return redactBreadcrumb(breadcrumb);
}

export function initSentry() {
  if (!SENTRY_DSN) return;

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    release: SENTRY_RELEASE,
    // dry-run에서도 파이프라인 검증이 되도록 SDK는 켜고, 실제 전송은 beforeSend에서 막는다
    enabled: true,

    // ── 성능 추적 (tracing) ──
    integrations: (defaultIntegrations) => {
      // 세션 추적은 beforeSend를 거치지 않고 전송되므로 dry-run에서는 제외한다
      const base = IS_DRY_RUN
        ? defaultIntegrations.filter(
            (integration) => !/session/i.test(integration.name)
          )
        : defaultIntegrations;

      return [...base, Sentry.browserTracingIntegration()];
    },
    // 프로덕션은 10%만 샘플링(무료 플랜 quota라 한도 고려), dry-run은 전송 자체를 하지 않음
    tracesSampleRate: IS_DRY_RUN ? 0 : import.meta.env.PROD ? 0.1 : 1.0,
    // trace 헤더(sentry-trace/baggage)를 전파할 대상 — API 도메인
    tracePropagationTargets: API_BASE_URL ? [API_BASE_URL] : [],

    // ── 노이즈 차단 ──
    // SESSION_EXPIRED는 정상 로그아웃 플로우, 나머지는 인앱브라우저·브라우저 내부 노이즈
    ignoreErrors: [/SESSION_EXPIRED/, ...NOISE_ERROR_PATTERNS],
    denyUrls: NOISE_DENY_URLS,

    // ── 개인정보·토큰 보호 ──
    sendDefaultPii: false,
    beforeSend: handleBeforeSend,
    beforeBreadcrumb: handleBeforeBreadcrumb,

    initialScope: {
      tags: {
        app: 'houme-client',
        mode: import.meta.env.MODE,
      },
    },
  });
}

export function getSentryReactErrorHandlerOptions() {
  if (!SENTRY_DSN) return undefined;

  return {
    onUncaughtError: Sentry.reactErrorHandler(),
    onCaughtError: Sentry.reactErrorHandler(),
    onRecoverableError: Sentry.reactErrorHandler(),
  };
}
