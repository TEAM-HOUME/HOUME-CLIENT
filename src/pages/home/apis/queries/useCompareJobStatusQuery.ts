import { useQuery } from '@tanstack/react-query';

import type { CompareJobStatusResponse } from '@pages/home/types/compare';
import { COMPARE_JOB_STATUS } from '@pages/home/types/compare';
import { isCompareJobNotFound } from '@pages/home/utils/compareJobError';

import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

/**
 * 폴링 주기.
 *
 * 서버가 알려준 단계별 예상 시간
 * - SCRAPING 2초 · SEARCHING 3~5초 · MERGING 5초 · SORTING 0.2초 미만
 * - 비교 job 한 건이 10~12초로 예상
 * - 우선 800ms로 설정해두고, API 연동 후 필요 시 재설정
 */
export const COMPARE_POLLING_INTERVAL_MS = 800;

export const getCompareJobStatus = async (
  jobId: string
): Promise<CompareJobStatusResponse> => {
  return request<CompareJobStatusResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.COMPARE.JOB_STATUS(jobId),
  });
};

/**
 * job 진행 상태 조회. DONE·FAILED가 오면 폴링 중지
 *
 * 에러 처리 관련)
 * - job 실패는 HTTP 에러가 아니라 200 + status FAILED 판단하므로 여기서 에러로 잡히지 않는다. 에러 종류 판별은 compareJobError.ts에서 담당한다.
 * - 이 쿼리의 error는 요청 자체가 거절된 경우(존재x jobId·인증·서버 오류)만 의미한다.
 *
 * 타임아웃 관련)
 * - 프론트 자체 타임아웃은 두지 않으며, 로딩 중 다른 화면으로 이동하는 것을 허용한다.
 * - 요청 처리 시간 초과는 서버가 errorCode 50025로 알려준다.
 */
export const useCompareJobStatusQuery = (jobId: string | null) => {
  return useQuery({
    queryKey: queryKeys.compare.jobStatus(jobId ?? ''),
    queryFn: () => getCompareJobStatus(jobId ?? ''),
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (
        status === COMPARE_JOB_STATUS.DONE ||
        status === COMPARE_JOB_STATUS.FAILED
      ) {
        return false;
      }
      return COMPARE_POLLING_INTERVAL_MS;
    },
    // 다른 탭·백그라운드로 넘어가도 폴링을 유지한다 (로딩 중 이동 허용 UX)
    refetchIntervalInBackground: true,
    retry: (failureCount, error) => {
      // 존재하지 않는 job은 재요청 시에도 없으므로 retry하지 않는다
      if (isCompareJobNotFound(error)) return false;
      return failureCount < 1;
    },
    // 폴링 응답은 매번 최신값이어야 하므로 캐시를 fresh하다고 보지 않는다
    staleTime: 0,
  });
};
