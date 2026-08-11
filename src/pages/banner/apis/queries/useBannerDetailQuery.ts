import { useQuery } from '@tanstack/react-query';

import type { BannerDetailResponse } from '@shared/apis/__generated__/data-contracts';

import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

export const getBannerDetail = async (
  bannerId: number
): Promise<BannerDetailResponse> => {
  return request<BannerDetailResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.BANNER.BANNER_DETAIL(bannerId),
  });
};

export const useBannerDetailQuery = (bannerId: number) => {
  return useQuery({
    queryKey: queryKeys.banner.detail(bannerId),
    queryFn: () => getBannerDetail(bannerId),
    enabled: bannerId > 0,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  });
};
