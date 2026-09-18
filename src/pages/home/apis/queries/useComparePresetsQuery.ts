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

/**
 * @param enabled 로그인 여부로 켠다. 서버가 비로그인 요청을 403으로 거절한다(2026-09-17 dev 실측).
 *   기획(P3')은 비로그인에도 프리셋을 보여주는 것이라 서버에 공개 여부를 확인 중이다. 공개되면 이 인자를 없앤다.
 */
export const useComparePresetsQuery = (enabled: boolean) => {
  return useQuery({
    queryKey: queryKeys.compare.presetList(),
    queryFn: getComparePresets,
    enabled,
    // 서버 고정값 — 한 번 받으면 다시 안 받아도 된다
    staleTime: Infinity,
  });
};
