import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type { MyPageUserResponse } from '@shared/types/user';

import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

type MyPageUserData = MyPageUserResponse['data'];
type UseMyPageUserOptions = Omit<
  UseQueryOptions<MyPageUserData, Error, MyPageUserData>,
  'queryKey' | 'queryFn'
>;

export const getMyPageUser = async (): Promise<MyPageUserData> => {
  return request<MyPageUserData>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.USER.MYPAGE,
  });
};

export const useMyPageUserQuery = (options?: UseMyPageUserOptions) => {
  return useQuery<MyPageUserData>({
    queryKey: queryKeys.mypage.user(),
    queryFn: getMyPageUser,
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    ...options,
  });
};
