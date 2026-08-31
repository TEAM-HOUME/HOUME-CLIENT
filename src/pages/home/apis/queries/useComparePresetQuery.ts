import { useQuery } from '@tanstack/react-query';

import { USE_COMPARE_MOCK } from '@pages/home/apis/compareJobMock';
import { getMockComparePreset } from '@pages/home/apis/comparePresetMock';
import type { ComparePresetResult } from '@pages/home/types/compare';
import { isComparePresetNotFound } from '@pages/home/utils/compareJobError';

import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

/**
 * 프리셋 고정 결과 조회.
 * 라이브 계산이 아니라 DB에 저장해 둔 값을 그대로 가져온다. 폴링하지 않는다.
 */
export const getComparePreset = async (
  presetId: number
): Promise<ComparePresetResult> => {
  // 서버 API 연동 전 임시 — comparePresetMock.ts와 함께 지운다
  if (USE_COMPARE_MOCK) return getMockComparePreset(presetId);

  return request<ComparePresetResult>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.COMPARE.PRESET(presetId),
  });
};

export const useComparePresetQuery = (presetId: number | null) => {
  return useQuery({
    // -1: parsePresetId가 \d+만 통과시켜 실제 presetId는 항상 0 이상 — 절대 안 겹치는 placeholder
    queryKey: queryKeys.compare.presetResult(presetId ?? -1),
    queryFn: () => getComparePreset(presetId ?? -1),
    enabled: presetId !== null,
    retry: (failureCount, error) => {
      if (isComparePresetNotFound(error)) return false;
      return failureCount < 1;
    },
    // 서버 고정 스냅샷 — 한 번 받으면 다시 안 받아도 된다
    staleTime: Infinity,
  });
};
