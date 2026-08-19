import { useQuery } from '@tanstack/react-query';

import type { FactorsResponse } from '@shared/apis/__generated__/data-contracts';

import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

export const getFactorsResponse = async (
  isLike: boolean
): Promise<FactorsResponse> => {
  return request<FactorsResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.GENERATE.FACTORS,
    query: { isLike },
  });
};

export const useFactorsQuery = (
  isLike: boolean,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: queryKeys.generate.factors(isLike),
    queryFn: () => getFactorsResponse(isLike),
    staleTime: 2 * 60 * 1000,
    gcTime: 1000 * 60 * 60 * 24,
    ...options,
  });
};
