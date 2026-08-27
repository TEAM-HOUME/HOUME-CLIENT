import { useQuery } from '@tanstack/react-query';

import type { BannerExploreListResponse } from '@apis/__generated__/data-contracts';
import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

export const getBannerList = async (
  bannerId: number
): Promise<BannerExploreListResponse> => {
  return request<BannerExploreListResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.BANNER.BANNER_EXPLORE(bannerId),
  });
};

export const useBannerListQuery = (bannerId: number) => {
  return useQuery({
    queryKey: queryKeys.banner.list(bannerId),
    queryFn: () => getBannerList(bannerId),
    enabled: bannerId > 0,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  });
};
