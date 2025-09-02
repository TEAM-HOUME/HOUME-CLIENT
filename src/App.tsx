import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { router } from '@/routes/router';
import { prefetchStaticData } from '@/shared/apis/staticDataPrefetch';

function App() {
  const queryClient = useQueryClient();

  useEffect(() => {
    prefetchStaticData(queryClient);
  }, []); // TODO(지성): useEffect 의존성 배열 확인

  return <RouterProvider router={router} />;
}

export default App;
