import { useQuery } from '@tanstack/react-query';

import type { OtherStyleDetailResponse } from '@apis/__generated__/data-contracts';
import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

export const getStyleDetail = async (
  styleId: number
): Promise<OtherStyleDetailResponse> => {
  return request<OtherStyleDetailResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.STYLES.STYLE_DETAIL(styleId),
  });
};

export const useStyleDetailQuery = (styleId: number) => {
  return useQuery({
    queryKey: queryKeys.styles.detail(styleId),
    queryFn: () => getStyleDetail(styleId),
    enabled: Number.isFinite(styleId),
  });
};
