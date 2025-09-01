import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { HousingOptionsResponse } from '@/pages/imageSetup/types/apis/houseInfo';
import { router } from '@/routes/router';
import { HTTPMethod, request } from '@/shared/apis/request';
import { API_ENDPOINT } from '@/shared/constants/apiEndpoints';

// API Functions - TODO: 별도 파일로 분리 예정
const getHousingOptions = async (): Promise<HousingOptionsResponse> => {
  return await request<HousingOptionsResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.IMAGE_SETUP.HOUSE_OPTIONS,
  });
};

function App() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // housingOptions 백그라운드에서 미리 로딩
    queryClient.prefetchQuery({
      queryKey: ['housing-options'],
      queryFn: getHousingOptions,
      staleTime: Infinity, // 정적 데이터이므로 무한 캐싱
      gcTime: 1000 * 60 * 60 * 24, // 24시간 가비지 컬렉션
    });
  }, [queryClient]);

  return <RouterProvider router={router} />;
}

export default App;
