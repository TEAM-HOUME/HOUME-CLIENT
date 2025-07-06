import { QueryCache, QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (import.meta.env.DEV) console.error('[React Query Error]', error);
    },
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // 브라우저 포커싱 시 자동 재요청 방지
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5분
    },
  },
});
