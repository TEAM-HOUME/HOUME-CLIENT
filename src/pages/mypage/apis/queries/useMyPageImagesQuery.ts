import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

import type {
  GeneratedImageListResponse,
  MyPageImagesResponse,
} from '../../types/apis/generateList';

type MyPageImagesData = MyPageImagesResponse['data'];
type UseMyPageImagesOptions = Omit<
  UseQueryOptions<MyPageImagesData, Error, MyPageImagesData>,
  'queryKey' | 'queryFn'
>;

export const getMyPageImages = async (): Promise<MyPageImagesData> => {
  return request<MyPageImagesData>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.USER.MYPAGE_IMAGES,
  });
};

export const useMyPageImagesQuery = (options?: UseMyPageImagesOptions) => {
  return useQuery<MyPageImagesData>({
    queryKey: queryKeys.mypage.images(),
    queryFn: getMyPageImages,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    ...options,
  });
};

// 마이페이지 생성 이미지 목록 조회 API (v2)
export const getGeneratedImageList =
  async (): Promise<GeneratedImageListResponse> => {
    return request<GeneratedImageListResponse>({
      method: HTTPMethod.GET,
      url: API_ENDPOINT.USER.MYPAGE_IMAGES_V2,
    });
  };

export const useGetGeneratedImageListQuery = () => {
  return useQuery<GeneratedImageListResponse>({
    queryKey: queryKeys.mypage.images(),
    queryFn: getGeneratedImageList,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
