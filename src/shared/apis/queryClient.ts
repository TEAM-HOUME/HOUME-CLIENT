import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // 브라우저 포커싱 시 자동 재요청 방지
      retry: false,
    },
  },
});
