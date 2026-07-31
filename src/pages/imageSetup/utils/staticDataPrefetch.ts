import type { SentryQueryMeta } from '@shared/monitoring/queryMeta';
import { MONITORING_SCOPE } from '@shared/monitoring/scope';

import { queryKeys } from '@constants/queryKey';

import { getActivities } from '../apis/queries/useActivitiesQuery';
import { getFurnitureCategories } from '../apis/queries/useFurnitureCategoriesQuery';
import { getMoodBoardImage } from '../apis/queries/useMoodBoardQuery';
import { STATIC_DATA_QUERY_OPTIONS } from '../constants/cache';
import { MOOD_BOARD_CONSTANTS } from '../types/apis/interiorStyle';
import { getHouseTemplates } from '../v2/apis/queries/useHouseTemplatesQuery';
import { DEFAULT_FILTERS } from '../v2/types/floorPlan';

import type { QueryClient } from '@tanstack/react-query';

/**
 * 앱 부팅과 동시에 나가는 백그라운드 요청이라 실패해도 사용자 영향이 없다.
 * (필요해지는 시점에 해당 화면의 쿼리가 다시 요청한다) → Sentry로는 보내지 않는다.
 */
const PREFETCH_QUERY_META: SentryQueryMeta = {
  sentry: { scope: MONITORING_SCOPE.API, capture: 'never' },
};

/**
 * 앱 시작 시점에 미리 로딩할 데이터들을 prefetch하는 함수
 */
export const prefetchStaticData = (queryClient: QueryClient) => {
  // 도면 전체 조회 (필터 없는 기본 응답을 미리 캐싱)
  // 카드 클릭 시 도면 상세 조회는 floorPlanId 의존이라 prefetch 대상 X
  queryClient.prefetchQuery({
    queryKey: queryKeys.imageSetup.houseTemplates(DEFAULT_FILTERS),
    queryFn: () => getHouseTemplates(DEFAULT_FILTERS),
    ...STATIC_DATA_QUERY_OPTIONS,
    meta: PREFETCH_QUERY_META,
  });

  // 주요활동 데이터 (활동 목록 + 활동별 필수 가구)
  queryClient.prefetchQuery({
    queryKey: queryKeys.imageSetup.activities(),
    queryFn: getActivities,
    ...STATIC_DATA_QUERY_OPTIONS,
    meta: PREFETCH_QUERY_META,
  });

  // 가구 카테고리 데이터 (카테고리 + 카테고리별 가구)
  queryClient.prefetchQuery({
    queryKey: queryKeys.imageSetup.furnitureCategories(),
    queryFn: getFurnitureCategories,
    ...STATIC_DATA_QUERY_OPTIONS,
    meta: PREFETCH_QUERY_META,
  });

  // 무드보드 이미지 데이터
  queryClient.prefetchQuery({
    queryKey: queryKeys.imageSetup.moodBoard(
      MOOD_BOARD_CONSTANTS.DEFAULT_LIMIT
    ),
    queryFn: () => getMoodBoardImage(),
    ...STATIC_DATA_QUERY_OPTIONS,
    meta: PREFETCH_QUERY_META,
  });
};
