// import { StrictMode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { OverlayProvider } from 'overlay-kit';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';

import App from './App.tsx';
import { queryClient } from './shared/apis/queryClient.ts';
import '@/shared/styles/global.css.ts';
import { toastConfig } from './shared/types/toast.ts';

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <QueryClientProvider client={queryClient}>
    <OverlayProvider>
      <App />
      <ToastContainer {...toastConfig} />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </OverlayProvider>
  </QueryClientProvider>
  // </StrictMode>
);
