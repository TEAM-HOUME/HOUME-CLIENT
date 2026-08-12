import { useQuery } from '@tanstack/react-query';

import type { CurationProductDetailResponse } from '@apis/__generated__/data-contracts';
import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

export const getProductDetail = async (
  id: number
): Promise<CurationProductDetailResponse> => {
  return request<CurationProductDetailResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.PRODUCT.DETAIL(id),
  });
};

export const useProductDetailQuery = (
  id: number,
  options?: { enabled?: boolean }
) => {
  const enabled = options?.enabled ?? true;

  return useQuery({
    queryKey: queryKeys.product.productDetail(id),
    queryFn: () => getProductDetail(id),
    enabled,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
  });
};
