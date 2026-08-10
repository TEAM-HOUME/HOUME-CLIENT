import { useMutation } from '@tanstack/react-query';

import { queryClient } from '@apis/config/queryClient';
import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

export const postCarouselLike = async (rawProductId: number): Promise<void> => {
  return request({
    method: HTTPMethod.POST,
    url: API_ENDPOINT.GENERATE.CAROUSELS_LIKE_V2,
    query: { rawProductId },
  });
};

export const usePostCarouselLikeMutation = () => {
  return useMutation({
    mutationFn: postCarouselLike,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mypage.jjymList() });
    },
  });
};
