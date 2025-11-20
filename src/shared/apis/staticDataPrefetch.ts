import { getActivityOptions } from '@/pages/imageSetup/apis/activityInfo';
import { getHousingOptions } from '@/pages/imageSetup/apis/houseInfo';
import { getMoodBoardImage } from '@/pages/imageSetup/apis/interiorStyle';
import { MOOD_BOARD_CONSTANTS } from '@/pages/imageSetup/types/apis/interiorStyle';

import type { QueryClient } from '@tanstack/react-query';

/**
 * 앱 시작 시점에 미리 로딩할 데이터들을 prefetch하는 함수
 */
export const prefetchStaticData = (queryClient: QueryClient) => {
  // 주거 옵션 데이터 (주거 형태, 구조, 평형)
  queryClient.prefetchQuery({
    queryKey: ['housing-options'],
    queryFn: getHousingOptions,
    staleTime: Infinity, // 정적 데이터이므로 무한 캐싱
    gcTime: 1000 * 60 * 60 * 24, // 24시간 가비지 컬렉션
  });

  // 활동 옵션 데이터 (주요 활동, 침대 타입, 가구 옵션)
  queryClient.prefetchQuery({
    queryKey: ['activity-options'],
    queryFn: getActivityOptions,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  });

  // 도면 이미지 데이터: roomType에 따라 다르므로 prefetch하지 않음
  // FloorPlan 컴포넌트에서 도면 요청

  // 무드보드 이미지 데이터
  queryClient.prefetchQuery({
    queryKey: ['moodBoardImages', MOOD_BOARD_CONSTANTS.DEFAULT_LIMIT],
    queryFn: () => getMoodBoardImage(),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  });
};
