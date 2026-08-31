import { useCallback, useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useCreateCompareJobMutation } from '@pages/home/apis/mutations/useCreateCompareJobMutation';
import { useCompareJobStatusQuery } from '@pages/home/apis/queries/useCompareJobStatusQuery';
import {
  buildCompareTabPath,
  COMPARE_JOB_ID_PARAM,
  COMPARE_PRESET_ID_PARAM,
  COMPARE_PRODUCT_URL_PARAM,
} from '@pages/home/constants/compareParams';
import {
  COMPARE_VIEW,
  type CompareView,
} from '@pages/home/constants/compareView';
import {
  COMPARE_JOB_STATUS,
  type CompareJobStage,
  type CompareJobStatus,
  type CompareResult,
  type CompareSourceStatus,
} from '@pages/home/types/compare';
import {
  getServerErrorCode,
  getServerErrorMessage,
  isCompareJobNotFound,
} from '@pages/home/utils/compareJobError';

import { LOGIN_ENTRY_ROUTE } from '@analytics/params/gate';

import { queryKeys } from '@constants/queryKey';

import { useLoginGate } from '@hooks/useLoginGate';

import type { SetURLSearchParams } from 'react-router-dom';

interface PriceCompareJob {
  jobId: string | null;
  /** 입력창에 채워둘 상품 URL. 딥링크 진입·로그인 복귀로 주소에 실려 온 값 */
  productUrl: string | null;
  view: CompareView;
  /** 진행 중일 때의 파이프라인 단계 — 로딩 뷰의 문구가 이 값에 매핑된다 */
  stage: CompareJobStage | null;
  result: CompareResult | null;
  /** SEARCHING 단계에서 3개 소스가 각각 어디까지 갔는지. 로딩 뷰의 소스별 표시가 쓴다 */
  sources: Record<'catalog' | 'coupang' | 'ebay', CompareSourceStatus> | null;
  /** 실패 분기용 코드. 서버 안내대로 문구가 아니라 이 값으로 분기한다 */
  errorCode: number | null;
  /** 실패했을 때 화면에 보여줄 완결된 문구. 실패가 아니면 null.
   * 서버 문구가 있으면 그걸, 없으면 이 훅이 job 사유(만료 등)에 맞는 기본 문구로 채운다 */
  errorMessage: string | null;
  start: (url: string) => void;
  /** 히스토리 클릭 시 주소에 productUrl을 넣어 입력창을 채운다 */
  selectProductUrl: (url: string) => void;
  /** job 생성 mutation 에러만 지운다. URL은 건드리지 않는다 */
  dismissCreateError: () => void;
}

/**
 * 가격 비교 job 한 건의 수명을 관리한다.
 *
 * job 생성 → jobId를 URL에 기록 → 상태 폴링 → job 화면 구분까지를 이 훅이 담당한다.
 * 프리셋 고정 결과는 useComparePreset / useCompareTab에서 다룬다.
 *
 * jobId를 URL에 두는 이유: 새로고침·뒤로가기·(공유)가 전부 URL 하나로 해결되기 때문.
 * 마운트 시 URL에 jobId가 있으면 그 job을 이어서 조회하므로 새로고침 복원 로직 불필요
 *
 * searchParams/setSearchParams는 useCompareTab이 useSearchParams()를 한 번만 호출해 내려준다.
 * 이 훅이 따로 useSearchParams()를 부르면 useComparePreset과 서로 다른 스냅샷을 들고 있게 되어,
 * 같은 틱에서 두 훅이 연달아 setSearchParams를 호출할 때 나중 호출이 앞의 변경을 덮어쓸 수 있다.
 */
export const usePriceCompareJob = (
  searchParams: URLSearchParams,
  setSearchParams: SetURLSearchParams
): PriceCompareJob => {
  const queryClient = useQueryClient();
  const jobId = searchParams.get(COMPARE_JOB_ID_PARAM);
  const productUrl = searchParams.get(COMPARE_PRODUCT_URL_PARAM);

  const { requireLogin } = useLoginGate();
  const {
    mutate: createJob,
    isPending: isCreatingJob,
    error: jobCreateError,
    reset: resetCreateJob,
  } = useCreateCompareJobMutation();
  const { data, error: jobStatusError } = useCompareJobStatusQuery(jobId);

  // job이 끝나면 히스토리만 무효화한다. 프리셋은 고정값이라 건드리지 않는다
  useEffect(() => {
    if (
      data?.status !== COMPARE_JOB_STATUS.DONE &&
      data?.status !== COMPARE_JOB_STATUS.FAILED
    ) {
      return;
    }

    void queryClient.invalidateQueries({
      queryKey: queryKeys.compare.historyAll(),
    });
  }, [data?.status, queryClient]);

  // job 생성 실패(400 등)와 상태 조회 실패를 같은 자리에서 다룬다.
  // - job 생성이 실패하면 URL에 jobId가 없어 입력 화면으로 되돌아감
  // - 이때 아무런 피드백이 없으면 사용자는 요청이 어떻게 진행되었는지 알 수 없으므로 예외처리 필요
  const jobRequestError = jobCreateError ?? jobStatusError;

  /** /?tab=compare&jobId=nextJobId와 같이 URL 쿼리 스트링을 write */
  const writeJobId = useCallback(
    (nextJobId: string | null, replace: boolean) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (nextJobId) {
            next.set(COMPARE_JOB_ID_PARAM, nextJobId);
            next.delete(COMPARE_PRODUCT_URL_PARAM);
            // job과 프리셋은 동시에 진행하지 않는다
            next.delete(COMPARE_PRESET_ID_PARAM);
          } else {
            next.delete(COMPARE_JOB_ID_PARAM);
          }
          return next;
        },
        { replace }
      );
    },
    [setSearchParams]
  );

  const selectProductUrl = useCallback(
    (url: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(COMPARE_PRODUCT_URL_PARAM, url);
          next.delete(COMPARE_JOB_ID_PARAM);
          next.delete(COMPARE_PRESET_ID_PARAM);
          return next;
        },
        // push — 뒤로가기로 이전 입력 상태로 돌아갈 수 있게 한다
        { replace: false }
      );
    },
    [setSearchParams]
  );

  const start = useCallback(
    (url: string) => {
      // 비로그인이면 로그인 화면으로 보낸다.
      // 이때 로그인 후 복귀할 경로에 상품 URL을 넣어, 돌아왔을 때 비교 탭 입력창에 그 값이 복원되도록 한다
      // 게이트는 기본적으로 게이트가 열린 시점의 주소를 복귀 경로로 저장하는데,
      // 사용자가 입력창에 붙여넣은 값은 React 상태에만 있고 주소(/?tab=compare)에는 없다.
      // 기본 동작에 맡기면 로그인 후 입력창이 빈 채로 돌아오므로 복귀 경로를 직접 만들어 넘긴다.
      const returnPath = buildCompareTabPath(url);

      requireLogin(
        () => {
          createJob(
            { url },
            // jobId는 항상 replace로 쓴다. 뒤로가기 목적지는 이 시점 이전 항목 (입력창에서 제출했으면 입력 화면, 딥링크로 들어왔으면 직전에 보던 사이트)이어야 한다
            { onSuccess: (response) => writeJobId(response.jobId, true) }
          );
        },
        LOGIN_ENTRY_ROUTE.COMPARE_SEARCH,
        returnPath
      );
    },
    [createJob, requireLogin, writeJobId]
  );

  const dismissCreateError = useCallback(() => {
    resetCreateJob();
  }, [resetCreateJob]);

  const isJobFailed = data?.status === COMPARE_JOB_STATUS.FAILED;
  const hasError = isJobFailed || Boolean(jobRequestError);

  const view = resolveJobView({
    hasJobId: Boolean(jobId),
    isCreatingJob,
    hasError: Boolean(jobRequestError),
    status: data?.status,
    productCount:
      data?.status === COMPARE_JOB_STATUS.DONE
        ? data.result.similarProducts.length
        : undefined,
  });

  return {
    jobId,
    productUrl,
    view,
    stage: data?.currentStage ?? null,
    result: data?.status === COMPARE_JOB_STATUS.DONE ? data.result : null,
    sources: data?.sources ?? null,
    errorCode: isJobFailed
      ? data.errorCode
      : getServerErrorCode(jobRequestError),
    errorMessage: resolveJobErrorMessage({
      hasError,
      isJobMissing: isCompareJobNotFound(jobStatusError),
      serverMessage: isJobFailed
        ? data.errorMessage
        : getServerErrorMessage(jobRequestError),
    }),
    start,
    selectProductUrl,
    dismissCreateError,
  };
};

interface ResolveJobViewParams {
  hasJobId: boolean;
  isCreatingJob: boolean;
  hasError: boolean;
  status: CompareJobStatus | undefined;
  productCount: number | undefined;
}

/** job 화면 구분은 이 함수 하나에 모아 둔다 — 뷰에서 조건을 다시 조립하지 않는다 */
const resolveJobView = ({
  hasJobId,
  isCreatingJob,
  hasError,
  status,
  productCount,
}: ResolveJobViewParams): CompareView => {
  if (isCreatingJob) return COMPARE_VIEW.LOADING;

  // 생성 실패는 jobId가 없는 상태로 발생하므로 입력 화면 판정보다 먼저 본다
  if (hasError) return COMPARE_VIEW.ERROR;
  if (!hasJobId) return COMPARE_VIEW.SEARCH;

  // 첫 조회 응답을 기다리는 중 — 아직 상태를 모름
  if (status === undefined) return COMPARE_VIEW.LOADING;

  switch (status) {
    case COMPARE_JOB_STATUS.DONE:
      return productCount === 0 ? COMPARE_VIEW.EMPTY : COMPARE_VIEW.RESULT;
    case COMPARE_JOB_STATUS.FAILED:
      return COMPARE_VIEW.ERROR;
    // PENDING(대기)·RUNNING(진행 중)은 둘 다 로딩 화면이다
    case COMPARE_JOB_STATUS.PENDING:
    case COMPARE_JOB_STATUS.RUNNING:
      return COMPARE_VIEW.LOADING;
  }
};

interface ResolveJobErrorMessageParams {
  hasError: boolean;
  isJobMissing: boolean;
  serverMessage: string | null;
}

/**
 * job 실패 문구도 이 함수 하나에서 완결한다 — CompareTab은 왜 실패했는지(isJobMissing) 몰라도 된다.
 * preset 쪽 동일 문구는 useComparePreset의 resolvePresetErrorMessage가 따로 담당한다.
 */
const resolveJobErrorMessage = ({
  hasError,
  isJobMissing,
  serverMessage,
}: ResolveJobErrorMessageParams): string | null => {
  if (!hasError) return null;
  if (serverMessage) return serverMessage;
  return isJobMissing ? '검색 결과가 만료되었어요' : '비교에 실패했어요';
};
