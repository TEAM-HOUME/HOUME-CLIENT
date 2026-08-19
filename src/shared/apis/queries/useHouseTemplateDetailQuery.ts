import { useQuery, type QueryClient } from '@tanstack/react-query';

import type { ExploreHouseTemplateDetailResponse } from '@apis/__generated__/data-contracts';
import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

export const getHouseTemplateDetail = async (
  floorPlanId: number
): Promise<ExploreHouseTemplateDetailResponse> => {
  return request<ExploreHouseTemplateDetailResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.IMAGE_SETUP.HOUSE_TEMPLATE_DETAIL(floorPlanId),
  });
};

/**
 * 캐시 우선 house-template detail 조회. 실패 시 undefined 반환(비치명적).
 * 카드 클릭 GA에 space_size 등을 채우기 위한 조회에 사용된다.
 */
export const fetchHouseTemplateDetail = async (
  queryClient: QueryClient,
  floorPlanId: number
): Promise<ExploreHouseTemplateDetailResponse | undefined> => {
  try {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.imageSetup.houseTemplateDetail(floorPlanId),
      queryFn: () => getHouseTemplateDetail(floorPlanId),
    });
  } catch {
    return undefined;
  }
};

export const useHouseTemplateDetailQuery = (floorPlanId: number | null) => {
  return useQuery({
    queryKey: queryKeys.imageSetup.houseTemplateDetail(floorPlanId ?? -1),
    queryFn: () => getHouseTemplateDetail(floorPlanId as number),
    enabled: floorPlanId !== null,
  });
};
