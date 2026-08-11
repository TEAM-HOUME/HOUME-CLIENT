import { useQuery } from '@tanstack/react-query';

import type { MyPageGeneratedImageV2Response } from '@apis/__generated__/data-contracts';
import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

// 마이페이지 생성 이미지 목록 조회 API (v2)
export const getGeneratedImageList =
  async (): Promise<MyPageGeneratedImageV2Response> => {
    return request<MyPageGeneratedImageV2Response>({
      method: HTTPMethod.GET,
      url: API_ENDPOINT.USER.MYPAGE_IMAGES_V2,
    });
  };

export const useGeneratedImageListQuery = () => {
  return useQuery<MyPageGeneratedImageV2Response>({
    queryKey: queryKeys.mypage.images(),
    queryFn: getGeneratedImageList,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
