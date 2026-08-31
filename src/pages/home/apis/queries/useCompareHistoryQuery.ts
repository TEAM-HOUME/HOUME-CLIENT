import { useEffect } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

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
 */
export const useCompareHistoryQuery = (
  enabled: boolean,
  limit = COMPARE_HISTORY_LIMIT
) => {
  const queryClient = useQueryClient();

  // 토큰 만료로 인한 강제 로그아웃은 axiosInstance의 인터셉터가 clearUser()만 하고
  // queryClient는 안 지운다(명시적 로그아웃 mutation만 clear() 함). enabled(=로그인 여부)가
  // false인 동안엔 항상 캐시를 지워서, 로그인 상태를 잃은 채로 이 훅이 다시 마운트되는
  // 경우(예: 결과 화면에서 세션이 끊긴 뒤 검색 화면으로 돌아옴)에도 이전 캐시가 안 남게 한다.
  // 그래도 화면에 표시되는 값의 최종 방어는 CompareSearch의 isLoggedIn 가드가 한다 —
  // 이 캐시 삭제는 정리용이지, 이것만으로 화면 정확성을 보장하지 않는다.
  useEffect(() => {
    if (!enabled) {
      queryClient.removeQueries({ queryKey: queryKeys.compare.historyAll() });
    }
  }, [enabled, queryClient]);

  return useQuery({
    queryKey: queryKeys.compare.history(limit),
    queryFn: () => getCompareHistory(limit),
    enabled,
    // 비교할 때마다 목록이 바뀌므로, 검색 화면에 들어올 때마다 다시 받는다
    staleTime: 0,
  });
};
