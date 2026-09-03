import { useQuery } from '@tanstack/react-query';

import { USE_COMPARE_MOCK } from '@pages/home/apis/compareJobMock';
import { MOCK_COMPARE_PRESETS } from '@pages/home/constants/compareMockData';
import type { ComparePresetsResponse } from '@pages/home/types/compare';

import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

/**
 * 프리셋 목록 조회.
 * 서버 API 연동 전 임시 — USE_COMPARE_MOCK 분기와 함께 지운다.
 */
export const getComparePresets = async (): Promise<ComparePresetsResponse> => {
  if (USE_COMPARE_MOCK) return MOCK_COMPARE_PRESETS;

  return request<ComparePresetsResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.COMPARE.PRESET_LIST,
  });
};

export const useComparePresetsQuery = () => {
  return useQuery({
    queryKey: queryKeys.compare.presetList(),
    queryFn: getComparePresets,
    // 서버 고정값 — 한 번 받으면 다시 안 받아도 된다
    staleTime: Infinity,
  });
};
