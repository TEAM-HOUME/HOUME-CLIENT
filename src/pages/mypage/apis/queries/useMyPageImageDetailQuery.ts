import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

import type { MyPageImageDetailData } from '../../types/apis/generateList';

type UseMyPageImageDetailOptions = Omit<
  UseQueryOptions<MyPageImageDetailData, Error, MyPageImageDetailData>,
  'queryKey' | 'queryFn'
>;

export const getMyPageImageDetail = async (
  houseId: number
): Promise<MyPageImageDetailData> => {
  return request<MyPageImageDetailData>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.USER.MYPAGE_IMAGE_DETAIL(houseId),
  });
};

export const useMyPageImageDetailQuery = (
  houseId: number,
  options?: UseMyPageImageDetailOptions
) => {
  return useQuery<MyPageImageDetailData>({
    queryKey: queryKeys.mypage.imageDetail(houseId),
    queryFn: () => getMyPageImageDetail(houseId),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    ...options,
  });
};
