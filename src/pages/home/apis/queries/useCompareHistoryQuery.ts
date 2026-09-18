import { useQuery } from '@tanstack/react-query';

import type { CompareHistoryResponse } from '@apis/__generated__/data-contracts';
import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

/** 검색 화면 최근 비교 목록 기본 limit */
export const COMPARE_HISTORY_LIMIT = 3;

/** 최근 비교 히스토리 조회. 비로그인 요청은 서버가 403으로 거절한다 */
export const getCompareHistory = async (
  limit: number
): Promise<CompareHistoryResponse> => {
  return request<CompareHistoryResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.COMPARE.HISTORY,
    query: { limit },
  });
};

/**
 * @param enabled 로그인 여부로 켠다. 비로그인이면 요청하지 않는다.
 * queryKey에 userId를 넣지 않는다 — mypage 등과 같이 토큰 기준 응답 + 로그아웃 시 queryClient.clear()에 맡긴다.
 */
export const useCompareHistoryQuery = (
  enabled: boolean,
  limit = COMPARE_HISTORY_LIMIT
) =>
  useQuery({
    queryKey: queryKeys.compare.history(limit),
    queryFn: () => getCompareHistory(limit),
    enabled,
    // 비교할 때마다 목록이 바뀌므로, 검색 화면에 들어올 때마다 다시 받는다
    staleTime: 0,
  });
