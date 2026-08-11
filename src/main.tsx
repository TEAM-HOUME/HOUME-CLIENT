// import { StrictMode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';
import 'sonner/dist/styles.css';

import { initClarity, upgradeClaritySession } from '@shared/config/clarity';
import {
  getSentryReactErrorHandlerOptions,
  initSentry,
} from '@shared/config/sentry';
import {
  AB_TEST_STORAGE_KEY,
  parseDevAbQueryOverride,
} from '@shared/types/abTest';

import { queryClient } from '@apis/config/queryClient';

import AppErrorFallback from '@components/errorFallback/AppErrorFallback';
import MainToaster from '@components/toast/Sonner';
import '@styles/global.css';

import App from './App';

initSentry();
initClarity();

// 개발 모드: ?ab=A|B (useABTest와 동일 — 앱 부트 시 storage 선반영)
if (import.meta.env.DEV) {
  try {
    const devOverride = parseDevAbQueryOverride();
    if (devOverride) {
      localStorage.setItem(AB_TEST_STORAGE_KEY, devOverride);
    }
  } catch {
    console.error(`Error setting ${AB_TEST_STORAGE_KEY}`);
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement, getSentryReactErrorHandlerOptions()).render(
  // <StrictMode>
  <ErrorBoundary
    FallbackComponent={AppErrorFallback}
    onError={() => upgradeClaritySession('error')}
  >
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <App />
        <MainToaster />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
  // </StrictMode>
);
