import { useQuery } from '@tanstack/react-query';

import type { RelatedImagesResponse } from '@shared/apis/__generated__/data-contracts';

import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

export const getRelatedImages = async (
  imageId: number
): Promise<RelatedImagesResponse> => {
  return request<RelatedImagesResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.GENERATE.RELATED_IMAGES(imageId),
  });
};

export const useRelatedImagesQuery = (imageId: number) => {
  return useQuery({
    queryKey: queryKeys.generate.relatedImages(imageId),
    queryFn: () => getRelatedImages(imageId),
    enabled: imageId > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 1000 * 60 * 60 * 24,
  });
};
