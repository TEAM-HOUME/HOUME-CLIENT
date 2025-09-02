import { useQuery } from '@tanstack/react-query';
import type { ActivityOptionsResponse } from '../types/apis/activityInfo';
import { HTTPMethod, request } from '@/shared/apis/request';
import { API_ENDPOINT } from '@/shared/constants/apiEndpoints';

export const getActivityOptions =
  async (): Promise<ActivityOptionsResponse> => {
    return await request<ActivityOptionsResponse>({
      method: HTTPMethod.GET,
      url: API_ENDPOINT.IMAGE_SETUP.ACTIVITY_OPTIONS,
    });
  };

export const useActivityOptionsQuery = () => {
  return useQuery({
    queryKey: ['activity-options'], // TODO(지성): 쿼리키 관리
    queryFn: getActivityOptions,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  });
};
