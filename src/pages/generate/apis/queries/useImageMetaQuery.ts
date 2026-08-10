import { useQuery } from '@tanstack/react-query';

import type { GeneratedImageMetaResponse } from '@shared/apis/__generated__/data-contracts';

import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

export const getImageMeta = async (
  imageId: number
): Promise<GeneratedImageMetaResponse> => {
  return request<GeneratedImageMetaResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.GENERATE.IMAGE_META(imageId),
  });
};

export const useImageMetaQuery = (
  imageId: number,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: queryKeys.generate.meta(imageId),
    queryFn: () => getImageMeta(imageId),
    enabled: (options?.enabled ?? true) && imageId > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 1000 * 60 * 60 * 24,
  });
};
