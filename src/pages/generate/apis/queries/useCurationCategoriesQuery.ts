import { useQuery } from '@tanstack/react-query';

import type { FurnitureCategoriesResponse } from '@shared/apis/__generated__/data-contracts';

import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

export const getCurationResultResponse = async (
  imageId: number
): Promise<FurnitureCategoriesResponse> => {
  return request<FurnitureCategoriesResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.GENERATE.CURATION_CATEGORIES_V2(imageId),
  });
};

export const useCurationCategoriesQuery = (imageId: number) => {
  return useQuery({
    queryKey: queryKeys.generate.curationCategories(imageId),
    queryFn: () => getCurationResultResponse(imageId),
    enabled: imageId > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 1000 * 60 * 60 * 24,
  });
};
