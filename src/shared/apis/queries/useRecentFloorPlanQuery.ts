import { type QueryClient, useQuery } from '@tanstack/react-query';

import type { RecentFloorPlanResponse } from '@apis/__generated__/data-contracts';
import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

export const getRecentFloorPlan =
  async (): Promise<RecentFloorPlanResponse> => {
    return request<RecentFloorPlanResponse>({
      method: HTTPMethod.GET,
      url: API_ENDPOINT.IMAGE_SETUP.RECENT_FLOOR_PLAN,
    });
  };

/** GA previous_space_* — RecentSheet 노출 여부와 동일하게 hasRecentImage 게이트 */
export const getRecentFloorPlanForAnalytics = (
  data: RecentFloorPlanResponse | undefined
): RecentFloorPlanResponse | null => (data?.hasRecentImage ? data : null);

/** viewSht_submit 등 제출 시점에 캐시/네트워크 최신값 보장 (home_space preset 빠른 확인 레이스 방지) */
export const ensureRecentFloorPlanForAnalytics = async (
  queryClient: QueryClient
): Promise<RecentFloorPlanResponse | null> => {
  try {
    const data = await queryClient.ensureQueryData({
      queryKey: queryKeys.imageSetup.recentFloorPlan(),
      queryFn: getRecentFloorPlan,
    });

    return getRecentFloorPlanForAnalytics(data);
  } catch {
    // GA enrichment 전용 — 실패해도 확인 플로우는 진행되어야 함
    const cached = queryClient.getQueryData<RecentFloorPlanResponse>(
      queryKeys.imageSetup.recentFloorPlan()
    );

    return getRecentFloorPlanForAnalytics(cached);
  }
};

export const useRecentFloorPlanQuery = () => {
  return useQuery({
    queryKey: queryKeys.imageSetup.recentFloorPlan(),
    queryFn: getRecentFloorPlan,
    // 이미지 생성 성공 후 '최근 생성한 도면'이 즉시 반영되어야 하므로 전역 staleTime(5분)을 override.
    // 기존 invalidate 로직의 간헐적 실패 원인:
    // 여러 페이지(HomePage, Style, Banner 등)가 이 쿼리를 observe하는데, 이미지 생성 후 재생성 플로우에서 사용자가 Home을 먼저 거치므로,
    // Home이 채운 fresh 캐시를 /imageSetup이 5분간 신뢰 → 진입 시 재요청이 스킵되어 간헐적 stale이 발생하는 것으로 예상..됨
    // => mount마다 무조건 재요청해 이를 원천 차단
    staleTime: 0,
    refetchOnMount: 'always',
  });
};
