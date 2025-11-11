// 가구 파이프라인 모니터링 로거
// - 목적: 콘솔 + Sentry 동시 보고로 이상 징후 추적

type SentryScopeLite = {
  setContext?: (name: string, context: Record<string, unknown>) => void;
  setLevel?: (level: string) => void;
};

type SentryClientLite = {
  withScope?: (cb: (scope: SentryScopeLite) => void) => void;
  captureMessage?: (message: string) => void;
};

const getSentryClient = (): SentryClientLite | null => {
  if (typeof window === 'undefined') return null;
  const sentry = (window as typeof window & { Sentry?: SentryClientLite })
    .Sentry;
  return sentry ?? null;
};

export const reportFurniturePipelineWarning = (
  message: string,
  extra?: Record<string, unknown>
) => {
  console.warn(`[FurniturePipeline] ${message}`, extra);
  const sentry = getSentryClient();
  if (!sentry?.withScope || !sentry.captureMessage) return;
  sentry.withScope?.((scope) => {
    if (extra) scope.setContext?.('furniturePipeline', extra);
    scope.setLevel?.('warning');
    sentry.captureMessage?.(message);
  });
};
