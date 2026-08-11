import { useQuery } from '@tanstack/react-query';

import type { FurnitureProductsInfoResponseV2 } from '@shared/apis/__generated__/data-contracts';

import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

export const getCurationProductsResponse = async (
  imageId: number,
  categoryId: number
): Promise<FurnitureProductsInfoResponseV2> => {
  return request<FurnitureProductsInfoResponseV2>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.GENERATE.CURATION_PRODUCTS(imageId, categoryId),
  });
};

export const useCurationProductsQuery = (
  imageId: number,
  categoryId: number
) => {
  return useQuery({
    queryKey: queryKeys.generate.curationProducts(imageId, categoryId),
    queryFn: () => getCurationProductsResponse(imageId, categoryId),
    enabled: imageId > 0 && categoryId > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 1000 * 60 * 60 * 24,
  });
};
