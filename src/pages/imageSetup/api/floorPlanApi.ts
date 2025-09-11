import { useQuery } from '@tanstack/react-query';

import { HTTPMethod, type RequestConfig, request } from '@/shared/apis/request';
import { API_ENDPOINT } from '@/shared/constants/apiEndpoints';

import { type FloorPlanResponse } from '../types/apis/floorPlan';

// API Functions
const getFloorPlan = async (): Promise<FloorPlanResponse['data']> => {
  const config: RequestConfig = {
    method: HTTPMethod.GET,
    url: API_ENDPOINT.IMAGE_SETUP.FLOOR_PLAN,
  };

  return await request<FloorPlanResponse['data']>(config);
};

// Query Hooks
/**
 * 도면 정보를 가져오는 커스텀 훅
 *
 * @returns useQuery 결과 객체
 *
 * @example
 * const { data, isLoading } = useFloorPlanApi();
 */
export const useFloorPlanApi = () => {
  const query = useQuery({
    queryKey: ['floorPlan'],
    queryFn: getFloorPlan,
  });

  return query;
};
