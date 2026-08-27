import { useQuery } from '@tanstack/react-query';

import type { CurationProductFilterResponse } from '@apis/__generated__/data-contracts';
import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

export const getFilterList =
  async (): Promise<CurationProductFilterResponse> => {
    return request<CurationProductFilterResponse>({
      method: HTTPMethod.GET,
      url: API_ENDPOINT.PRODUCT.FILTERS,
    });
  };

export const useFilterListQuery = () => {
  return useQuery({
    queryKey: queryKeys.product.productFilters(),
    queryFn: getFilterList,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  });
};
