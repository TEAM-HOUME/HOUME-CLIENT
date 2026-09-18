import { useQuery } from '@tanstack/react-query';

import {
  COMPARE_JOB_STATUS,
  type CompareJobStatusResponse,
} from '@pages/home/types/compare';
import {
  isCompareJobNotFound,
  isCompareJobPermanentError,
} from '@pages/home/utils/compareJobError';

import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

/**
 * 폴링 주기.
 *
 * 서버 명세의 단계별 예상 시간은 SCRAPING 2초 · SEARCHING 3~5초 · MERGING 5초였고,
 * 2026-09-17 dev 실측에서는 생성 후 2~3초 안에 DONE이 됐다. 1초면 완료를 최대 1초 늦게 본다.
 */
export const COMPARE_POLLING_INTERVAL_MS = 1_000;

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
 * - job 실패는 HTTP 에러가 아니라 200 + status FAILED로 판단하므로 여기서 에러로 잡히지 않는다. 에러 종류 판별은 compareJobError.ts에서 담당한다.
 * - 이 쿼리의 error는 요청 자체가 거절된 경우(존재x jobId·인증·서버 오류)만 의미한다.
 *
 * 타임아웃 관련)
 * - 프론트 자체 타임아웃은 두지 않으며, 로딩 중 다른 화면으로 이동하는 것을 허용한다.
 * - 요청 처리 시간 초과는 서버가 errorCode 50025로 알려준다.
 */
export const useCompareJobStatusQuery = (
  jobId: string | null,
  /**
   * polling=false면 이 구독자는 주기 요청을 보내지 않고 캐시만 본다.
   * 같은 job을 비교 탭과 CompareJobWatcher(routes/)가 동시에 구독할 때 요청이 두 배가 되지 않게,
   * 한쪽(비교 탭이 그 job을 보고 있으면 비교 탭)만 폴링한다. queryKey가 같아 응답은 양쪽이 같이 본다
   */
  { polling = true }: { polling?: boolean } = {}
) => {
  return useQuery({
    queryKey: queryKeys.compare.jobStatus(jobId ?? ''),
    queryFn: () => getCompareJobStatus(jobId ?? ''),
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      if (!polling) return false;

      // 다시 요청해도 같은 실패(없는 job·인증 거절·세션 만료)면 멈춘다. 여기서 멈추지 않으면
      // 사용자가 떠난 화면에서 1초마다 요청이 계속 나간다 (다른 탭으로 가도 계속됨).
      // 오프라인·일시적 5xx는 계속 폴링해 복구되면 이어서 본다
      if (query.state.status === 'error') {
        return isCompareJobPermanentError(query.state.error)
          ? false
          : COMPARE_POLLING_INTERVAL_MS;
      }

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
