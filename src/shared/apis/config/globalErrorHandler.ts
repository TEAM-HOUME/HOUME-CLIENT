import { createElement } from 'react';

import { toast } from 'sonner';

import { ROUTES } from '@routes/paths';

import {
  decideApiReport,
  type ApiCaptureMode,
} from '@shared/monitoring/apiReportPolicy';
import {
  classifyApiError,
  isSessionExpiredError,
} from '@shared/monitoring/classifyApiError';
import type { SentryQueryMeta } from '@shared/monitoring/queryMeta';
import { addReportBreadcrumb, reportError } from '@shared/monitoring/report';
import { MONITORING_SCOPE } from '@shared/monitoring/scope';
import { TOASTER_ID, TOAST_TYPE } from '@shared/types/toast';

import Toast from '@components/v2/toast/Toast';
import { toastStyle } from '@components/v2/toast/Toast.css';

import type { Mutation, Query } from '@tanstack/react-query';

// React 외부 toast 유틸 (훅을 쓸 수 없는 모듈 스코프에서 사용)
const showGlobalToast = (text: string, hasIcon = true) => {
  toast.custom(
    () => createElement(Toast, { text, type: TOAST_TYPE.ERROR, hasIcon }),
    {
      toasterId: TOASTER_ID.BOTTOM_4,
      style: toastStyle,
    }
  );
};

// React 외부 navigate (dynamic import로 순환 참조 방지)
const redirectTo = async (path: string): Promise<void> => {
  const { router } = await import('@/routes/router');
  router.navigate(path);
};

// 중복 방지 (여러 쿼리가 동시에 실패할 때)
let lastSessionExpiredAt = 0;
const SESSION_EXPIRED_COOLDOWN = 5000;

const handleSessionExpired = () => {
  const now = Date.now();
  if (now - lastSessionExpiredAt < SESSION_EXPIRED_COOLDOWN) return;
  lastSessionExpiredAt = now;

  showGlobalToast('세션이 만료되었습니다. 다시 로그인해주세요.');
  setTimeout(() => redirectTo(ROUTES.LOGIN), 1000);
};

/**
 * 사용자에게 보여줄 처리 (toast/redirect)
 * QueryCache/MutationCache의 onError 어댑터가 호출한다.
 */
export const handleGlobalError = (error: unknown) => {
  if (import.meta.env.DEV) console.error('[QueryClient Error]', error);

  if (isSessionExpiredError(error)) {
    handleSessionExpired();
  }
};

/**
 * queryKey/mutationKey에서 앞 2개 세그먼트만 문자열로 뽑는다.
 *
 * 키 전체를 붙이지 않는 이유: `queryKeys.product.productList`처럼
 * 세 번째 세그먼트에 검색어 등 사용자 입력이 들어가는 키가 있다.
 */
const toKeyLabel = (key: unknown): string | undefined => {
  if (!Array.isArray(key)) return undefined;

  const label = key
    .slice(0, 2)
    .filter(
      (segment) => typeof segment === 'string' || typeof segment === 'number'
    )
    .join('.');

  return label || undefined;
};

interface ReportApiErrorOptions {
  isMutation: boolean;
  meta?: SentryQueryMeta;
  keyLabel?: string;
}

/**
 * API 실패를 Sentry로 보낸다.
 *
 * 캡처 지점을 여기 한 곳으로 모아 호출부의 중복 전송을 구조적으로 막는다.
 * 전송하지 않기로 한 실패도 breadcrumb는 남겨 이후 이벤트에 맥락으로 붙게 한다.
 */
const reportApiError = (error: unknown, options: ReportApiErrorOptions) => {
  const info = classifyApiError(error);
  const captureMode: ApiCaptureMode = options.meta?.sentry?.capture ?? 'auto';
  const scope = options.meta?.sentry?.scope ?? MONITORING_SCOPE.API;

  const context = {
    kind: info.kind,
    method: info.method,
    path: info.routePattern,
    status: info.status,
    serverCode: info.code,
    key: options.keyLabel,
    requestType: options.isMutation ? 'mutation' : 'query',
  };

  addReportBreadcrumb({
    category: 'api',
    message: `${info.method ?? '-'} ${info.routePattern ?? '-'} ${info.status ?? info.kind}`,
    level: 'warning',
    data: context,
  });

  const decision = decideApiReport(info, {
    isMutation: options.isMutation,
    captureMode,
  });
  if (!decision) return;

  reportError(error, {
    scope,
    level: decision.level,
    fingerprint: decision.fingerprint,
    context,
    tags: {
      'api.kind': info.kind,
      ...(info.status !== undefined
        ? { 'api.status': String(info.status) }
        : {}),
      ...(info.code !== undefined ? { 'api.code': String(info.code) } : {}),
    },
  });
};

/** QueryCache의 onError — 모든 useQuery 실패가 여기를 통과 */
export const handleQueryError = (
  error: unknown,
  query: Query<unknown, unknown, unknown>
) => {
  handleGlobalError(error);

  reportApiError(error, {
    isMutation: false,
    meta: query.meta,
    keyLabel: toKeyLabel(query.queryKey),
  });
};

/** MutationCache의 onError — 모든 useMutation 실패가 여기를 지난다 */
export const handleMutationError = (
  error: unknown,
  _variables: unknown,
  _context: unknown,
  mutation: Mutation<unknown, unknown, unknown>
) => {
  handleGlobalError(error);

  reportApiError(error, {
    isMutation: true,
    meta: mutation.options.meta,
    keyLabel: toKeyLabel(mutation.options.mutationKey),
  });
};
