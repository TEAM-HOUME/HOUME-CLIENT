import { useMutation } from '@tanstack/react-query';

import type { ApiResponseVoid } from '@shared/apis/__generated__/data-contracts';

import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';

export const deleteResultPreference = async (
  imageId: number
): Promise<ApiResponseVoid['data']> => {
  return request<ApiResponseVoid['data']>({
    method: HTTPMethod.DELETE,
    url: API_ENDPOINT.GENERATE.IMAGE_PREFERENCE(imageId),
  });
};

export const useDeleteResultPreferenceMutation = () => {
  return useMutation({
    mutationFn: (imageId: number) => deleteResultPreference(imageId),
  });
};
