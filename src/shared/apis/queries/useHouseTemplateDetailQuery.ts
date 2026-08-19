import { skipToken, useQuery, type QueryClient } from '@tanstack/react-query';

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
    // skipToken 사용 -> floorPlanId가 아직 없을 때(null일 때) 서버에 API 요청을 보내지 않도록 막을 수 있음
    // 기존처럼 `enabled: floorPlanId !== null`로 막고 queryFn에서 floorPlanId!로 단언하면, 나중에 enabled를 고칠 때 단언이 조용히 거짓이 될 가능성이 있음(ex: enabled 항상 true로 고친다면, floorPlanId가 null인데도 단언은 그대로 유지해 오류가 발생할 수 있음)
    // => Tanstack Query(v5+)에서 추가된 skipToken으로 queryFn 자리 하나에서 모든 걸 결정
    queryFn:
      floorPlanId === null
        ? skipToken // 1. id가 null이면 -> API 요청 스킵(자동으로 enabled: false 처리)
        : () => getHouseTemplateDetail(floorPlanId), // id가 있으면? 함수 실행
  });
};
