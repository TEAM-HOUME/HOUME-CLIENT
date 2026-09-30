import { useQuery } from '@tanstack/react-query';

import type { PresetListResponse } from '@apis/__generated__/data-contracts';
import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

/** 프리셋 목록 조회 */
export const getComparePresets = async (): Promise<PresetListResponse> => {
  return request<PresetListResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.COMPARE.PRESET_LIST,
  });
};

/** 비로그인도 조회할 수 있다(서버가 허용으로 변경) */
export const useComparePresetsQuery = () => {
  return useQuery({
    queryKey: queryKeys.compare.presetList(),
    queryFn: getComparePresets,
    // 서버 고정값 — 한 번 받으면 다시 안 받아도 된다
    staleTime: Infinity,
  });
};
