import { useQuery } from '@tanstack/react-query';

import { USE_COMPARE_MOCK } from '@pages/home/apis/compareJobMock';
import { MOCK_COMPARE_HISTORY } from '@pages/home/constants/compareMockData';
import type { CompareHistoryResponse } from '@pages/home/types/compare';

import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

/** 검색 화면 최근 비교 목록 기본 limit */
export const COMPARE_HISTORY_LIMIT = 3;

/**
 * 최근 비교 히스토리 조회.
 * 서버 API 연동 전 임시 — USE_COMPARE_MOCK 분기와 함께 지운다.
 */
export const getCompareHistory = async (
  limit: number
): Promise<CompareHistoryResponse> => {
  if (USE_COMPARE_MOCK) {
    return {
      items: MOCK_COMPARE_HISTORY.items.slice(0, limit),
    };
  }

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
