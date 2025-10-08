// import { StrictMode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { OverlayProvider } from 'overlay-kit';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';

import App from './App.tsx';
import { queryClient } from './shared/apis/queryClient.ts';
import '@/shared/styles/global.css.ts';
import { toastConfig } from './shared/types/toast.ts';

// 개발 모드: 최초 진입 시 ?ab=single|multiple 을 로컬스토리지에 저장
if (import.meta.env.DEV) {
  try {
    const sp = new URLSearchParams(window.location.search);
    const ab = sp.get('ab');
    if (ab === 'single' || ab === 'multiple') {
      localStorage.setItem('ab_image_variant', ab);
    }
  } catch {
    console.error('Error setting ab_image_variant');
  }
}

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <OverlayProvider>
        <App />
        <ToastContainer {...toastConfig} />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </OverlayProvider>
    </QueryClientProvider>
  </HelmetProvider>
  // </StrictMode>
);
