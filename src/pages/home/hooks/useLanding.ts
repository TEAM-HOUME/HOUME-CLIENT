import { useQuery } from '@tanstack/react-query';

import { QUERY_KEY } from '@/shared/constants/queryKey';

import { getHistoryData } from '../apis/landing';

export const useLandingData = () => {
  return useQuery({
    queryKey: [QUERY_KEY.LANDING],
    queryFn: () => getHistoryData(),
    select: (data) => data ?? false,
  });
};
