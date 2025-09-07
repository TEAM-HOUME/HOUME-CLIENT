import type { QueryClient } from '@tanstack/react-query';
import { getHousingOptions } from '@/pages/imageSetup/apis/houseInfo';
import { getActivityOptions } from '@/pages/imageSetup/apis/activityInfoApi';

/**
 * 앱 시작 시점에 미리 로딩할 데이터들을 prefetch하는 함수
 */
export const prefetchStaticData = async (queryClient: QueryClient) => {
  const prefetchPromises = [
    // 주거 옵션 데이터 (주거 형태, 구조, 평형)
    queryClient.prefetchQuery({
      queryKey: ['housing-options'],
      queryFn: getHousingOptions,
      staleTime: Infinity, // 정적 데이터이므로 무한 캐싱
      gcTime: 1000 * 60 * 60 * 24, // 24시간 가비지 컬렉션
    }),

    // 활동 옵션 데이터 (주요 활동, 침대 타입, 가구 옵션)
    queryClient.prefetchQuery({
      queryKey: ['activity-options'],
      queryFn: getActivityOptions,
      staleTime: Infinity,
      gcTime: 1000 * 60 * 60 * 24,
    }),

    // TODO(지성): 무드보드, 도면 GET API prefetching 추가
  ];
};
