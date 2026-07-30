import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import { prefetchStaticData } from '@pages/imageSetup/utils/staticDataPrefetch';

import { isSessionExpiredError } from '@shared/monitoring/classifyApiError';

import { handleMutationError, handleQueryError } from './globalErrorHandler';

export const queryClient = new QueryClient({
  // 사용자 처리(toast/redirect) + Sentry 전송을 함께 담당하는 어댑터
  queryCache: new QueryCache({ onError: handleQueryError }),
  mutationCache: new MutationCache({ onError: handleMutationError }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // 브라우저 포커싱 시 자동 재요청 방지
      retry: (failureCount, error) => {
        if (isSessionExpiredError(error)) return false;
        if (isAxiosError(error)) {
          const status = error.response?.status;
          if (status === 401 || status === 403) return false;
        }
        return failureCount < 1;
      },
      staleTime: 1000 * 60 * 5,
    },
    mutations: {
      retry: false,
    },
  },
});

prefetchStaticData(queryClient);
