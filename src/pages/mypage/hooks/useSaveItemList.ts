import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { QUERY_KEY } from '@/shared/constants/queryKey';

import { getJjymList } from '../apis/saveItems';

import type { FurnitureItem, JjymsResponse } from '../types/apis/saveItems';

export const useGetJjymList = (
  options?: UseQueryOptions<JjymsResponse, unknown, FurnitureItem[]>
) => {
  return useQuery({
    queryKey: [QUERY_KEY.JJYM_LIST],
    queryFn: getJjymList,
    select: (data) => data.items,
    staleTime: 0,
    refetchOnMount: 'always',
    ...options,
  });
};
