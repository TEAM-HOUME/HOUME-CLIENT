import { useQuery } from '@tanstack/react-query';

import type { SimilarItemsResponse } from '@shared/apis/__generated__/data-contracts';

import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

export const getSimilarItems = async (
  imageId: number
): Promise<SimilarItemsResponse> => {
  return request<SimilarItemsResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.GENERATE.SIMILAR_ITEMS(imageId),
  });
};

export const useSimilarItemsQuery = (imageId: number) => {
  return useQuery({
    queryKey: queryKeys.generate.similarItems(imageId),
    queryFn: () => getSimilarItems(imageId),
    enabled: imageId > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 1000 * 60 * 60 * 24,
  });
};
