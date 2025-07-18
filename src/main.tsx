// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { OverlayProvider } from 'overlay-kit';
import { ToastContainer } from 'react-toastify';
import { queryClient } from './shared/apis/queryClient.ts';
import '@/shared/styles/global.css.ts';
import App from './App.tsx';
import { toastConfig } from './shared/types/toast.ts';

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <QueryClientProvider client={queryClient}>
    <OverlayProvider>
      <App />
      <ToastContainer {...toastConfig} />
      {/* {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />} */}
    </OverlayProvider>
  </QueryClientProvider>
  // </StrictMode>
);
