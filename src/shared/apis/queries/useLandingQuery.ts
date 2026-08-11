import { useQuery } from '@tanstack/react-query';

import type { LandingListResponse } from '@shared/apis/__generated__/data-contracts';

import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

export const getLandingList = async (): Promise<LandingListResponse> => {
  return request<LandingListResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.BANNER.LANDING,
  });
};

export const useLandingQuery = () => {
  return useQuery({
    queryKey: queryKeys.landing.all,
    queryFn: getLandingList,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  });
};
