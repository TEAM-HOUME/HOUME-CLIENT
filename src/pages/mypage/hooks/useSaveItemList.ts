import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { QUERY_KEY } from '@/shared/constants/queryKey';

import { getJjymList } from '@pages/mypage/apis/saveItemsList';

import type {
  FurnitureItem,
  JjymsResponse,
} from '@pages/mypage/types/apis/saveItemsList';

export const useGetJjymListQuery = (
  options?: UseQueryOptions<JjymsResponse, unknown, FurnitureItem[]>
) => {
  return useQuery({
    queryKey: [QUERY_KEY.JJYM_LIST],
    queryFn: getJjymList,
    select: (data) => data.items,
    ...options,
  });
};
