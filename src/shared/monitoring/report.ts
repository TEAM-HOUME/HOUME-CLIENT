import * as Sentry from '@sentry/react';

import type { MonitoringScope } from './scope';
import type { SeverityLevel } from '@sentry/react';

/**
 * Sentry 전송 래퍼
 *
 * 앱 코드는 `@sentry/react`를 직접 부르지 않고 이 모듈만 사용한다.
 * Sentry 미초기화(DSN 없음) 상태에서도 안전하게 no-op으로 동작한다.
 */

/**
 * 이벤트에 붙일 수 있는 부가 정보
 *
 * 객체·배열을 허용하지 않는 이유: 응답 바디나 폼 값이 통째로 실려
 * 개인정보가 새는 것을 타입 단계에서 막기 위함이다.
 * 값이 필요하면 개수·존재 여부 같은 요약으로 바꿔서 넣는다.
 */
export type ReportContext = Record<
  string,
  string | number | boolean | null | undefined
>;

interface ReportOptions {
  /** 기능 도메인 (Sentry `scope` 태그로 전송) */
  scope: MonitoringScope;
  context?: ReportContext;
  tags?: Record<string, string>;
  level?: SeverityLevel;
  /** 이슈 그룹핑 키. 지정하지 않으면 Sentry 기본 그룹핑을 따른다 */
  fingerprint?: string[];
}

const applyOptions = (sentryScope: Sentry.Scope, options: ReportOptions) => {
  sentryScope.setTag('scope', options.scope);

  if (options.level) sentryScope.setLevel(options.level);
  if (options.fingerprint) sentryScope.setFingerprint(options.fingerprint);

  if (options.tags) {
    Object.entries(options.tags).forEach(([key, value]) => {
      sentryScope.setTag(key, value);
    });
  }

  if (options.context) {
    sentryScope.setContext('houme', options.context);
  }
};

/** 에러 객체를 Sentry로 전송한다 */
export const reportError = (error: unknown, options: ReportOptions): void => {
  Sentry.withScope((sentryScope) => {
    applyOptions(sentryScope, options);
    Sentry.captureException(error);
  });
};

/** 에러 객체 없이 상황만 알릴 때 사용한다 (조용한 폴백 노출 등) */
export const reportMessage = (
  message: string,
  options: ReportOptions
): void => {
  Sentry.withScope((sentryScope) => {
    applyOptions(sentryScope, options);
    Sentry.captureMessage(message, options.level ?? 'warning');
  });
};

/**
 * 이후 전송되는 모든 이벤트에 붙는 태그를 설정한다.
 *
 * `null`을 넘기면 태그를 지운다. 값이 사라진 뒤에도 옛 값이 남아
 * 잘못된 화면·경로로 표시되는 것을 막기 위함이다.
 */
export const setReportTag = (key: string, value: string | null): void => {
  Sentry.setTag(key, value ?? undefined);
};

/**
 * 이벤트로 보내지 않고 흔적만 남긴다.
 * 별도 quota를 소모하지 않으면서 이후 실제 이벤트에 맥락으로 첨부된다.
 */
export const addReportBreadcrumb = (breadcrumb: {
  category: string;
  message: string;
  level?: SeverityLevel;
  data?: ReportContext;
}): void => {
  Sentry.addBreadcrumb(breadcrumb);
};
