import { useMutation } from '@tanstack/react-query';

import type { ApiResponseVoid } from '@shared/apis/__generated__/data-contracts';

import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';

export const postResultPreference = async (
  imageId: number,
  isLike: boolean
): Promise<ApiResponseVoid['data']> => {
  return request<ApiResponseVoid['data']>({
    method: HTTPMethod.POST,
    url: API_ENDPOINT.GENERATE.IMAGE_PREFERENCE(imageId),
    body: { isLike },
  });
};

export const useResultPreferenceMutation = () => {
  return useMutation({
    mutationFn: ({ imageId, isLike }: { imageId: number; isLike: boolean }) =>
      postResultPreference(imageId, isLike),
  });
};
