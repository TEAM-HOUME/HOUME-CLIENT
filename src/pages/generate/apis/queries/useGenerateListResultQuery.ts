import { useQuery } from '@tanstack/react-query';

import type { GenerateImageResultResponse } from '@shared/apis/__generated__/data-contracts';

import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

export const getGenerateListResultResponse = async (
  imageId: number
): Promise<GenerateImageResultResponse> => {
  return request<GenerateImageResultResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.GENERATE.LIST_RESULT_ITEMS(imageId),
  });
};

export const useGenerateListResultQuery = (imageId: number) => {
  return useQuery({
    queryKey: queryKeys.generate.listResultItems(imageId),
    queryFn: () => getGenerateListResultResponse(imageId),
    enabled: imageId > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 1000 * 60 * 60 * 24,
  });
};
