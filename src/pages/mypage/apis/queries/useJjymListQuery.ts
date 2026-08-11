import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

import type {
  FurnitureItem,
  JjymsResponse,
} from '../../types/apis/saveItemsList';

export const getJjymList = async (): Promise<JjymsResponse> => {
  return request<JjymsResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.GENERATE.MYPAGE_JJYM_LIST_V2,
  });
};

type GetJjymListQueryOptions = Omit<
  UseQueryOptions<JjymsResponse, unknown, FurnitureItem[]>,
  'queryKey' | 'queryFn' | 'select'
>;

export const useJjymListQuery = (options?: GetJjymListQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.mypage.jjymList(),
    queryFn: getJjymList,
    select: (data) => data.items,
    ...options,
  });
};
