import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type {
  JjymV2ItemResponse,
  JjymV2ListResponse,
} from '@apis/__generated__/data-contracts';
import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

export const getJjymList = async (): Promise<JjymV2ListResponse> => {
  return request<JjymV2ListResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.GENERATE.MYPAGE_JJYM_LIST_V2,
  });
};

type GetJjymListQueryOptions = Omit<
  UseQueryOptions<JjymV2ListResponse, unknown, JjymV2ItemResponse[]>,
  'queryKey' | 'queryFn' | 'select'
>;

export const useJjymListQuery = (options?: GetJjymListQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.mypage.jjymList(),
    queryFn: getJjymList,
    select: (data) => data.items ?? [],
    ...options,
  });
};
