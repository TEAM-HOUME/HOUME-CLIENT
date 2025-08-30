import { useQuery } from '@tanstack/react-query';
import { type FloorPlanResponse } from '../types/apis/floorPlan';
import { HTTPMethod, type RequestConfig, request } from '@/shared/apis/request';

// API Functions
const getFloorPlan = async (): Promise<FloorPlanResponse['data']> => {
  const config: RequestConfig = {
    method: HTTPMethod.GET,
    url: '/api/v1/house-templates',
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
