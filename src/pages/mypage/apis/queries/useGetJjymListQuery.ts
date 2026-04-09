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

export const useGetJjymListQuery = (
  options?: UseQueryOptions<JjymsResponse, unknown, FurnitureItem[]>
) => {
  return useQuery({
    queryKey: queryKeys.jjym.list(),
    queryFn: getJjymList,
    select: (data) => data.items,
    ...options,
  });
};
