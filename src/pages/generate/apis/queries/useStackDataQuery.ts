import { useQuery } from '@tanstack/react-query';

import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

import type { GetCarouselV2ListResponseDTO } from '@/shared/apis/__generated__/data-contracts';

export const getStackData = async (): Promise<GetCarouselV2ListResponseDTO> => {
  const res = await request<GetCarouselV2ListResponseDTO>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.GENERATE.CAROUSELS_V2,
  });
  return res;
};

export const useStackDataQuery = (enabled: boolean) => {
  return useQuery<GetCarouselV2ListResponseDTO, unknown>({
    queryKey: queryKeys.generate.stack(),
    queryFn: () => getStackData(),
    staleTime: 2 * 60 * 1000,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 2,
    enabled,
  });
};
