import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { router } from '@/routes/router';
import { prefetchStaticData } from '@/shared/apis/staticDataPrefetch';

function App() {
  const queryClient = useQueryClient();

  // TODO(지성): 앱 실행 시점 일괄 요청 시 초기 로딩 속도 등 성능 테스트
  useEffect(() => {
    prefetchStaticData(queryClient);
  }, []); // TODO(지성): useEffect 의존성 배열 확인

  return <RouterProvider router={router} />;
}

export default App;
