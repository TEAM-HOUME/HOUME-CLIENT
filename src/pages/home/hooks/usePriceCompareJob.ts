import { useCallback } from 'react';

import { useSearchParams } from 'react-router-dom';

import { useCreateCompareJobMutation } from '@pages/home/apis/mutations/useCreateCompareJobMutation';
import { useCompareJobStatusQuery } from '@pages/home/apis/queries/useCompareJobStatusQuery';
import {
  COMPARE_JOB_STATUS,
  type CompareEntrySource,
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

import { ROUTES } from '@routes/paths';

import { LOGIN_ENTRY_ROUTE } from '@analytics/params/gate';

import { useLoginGate } from '@hooks/useLoginGate';

/** 진행 중인 비교를 가리키는 URL 쿼리 파라미터 이름 (`/?tab=compare&jobId=xxx`) */
export const COMPARE_JOB_ID_PARAM = 'jobId';

/**
 *  DeepLinkRoute에서 상품 URL을 복원
 * → URL 쿼리 파라미터에 상품 URL 추가
 * → CompareTab이 읽어 job 생성 요청
 * → job이 생성되면 ?productUrl=...은 지우고 ?jobId=... 추가
 */
export const COMPARE_PRODUCT_URL_PARAM = 'productUrl';

/** 비교 탭이 지금 무엇을 그려야 하는지 */
export const COMPARE_VIEW = {
  SEARCH: 'search', // 링크 입력창 + 히스토리 + 프리셋이 보이는 화면
  LOADING: 'loading',
  RESULT: 'result',
  EMPTY: 'empty',
  ERROR: 'error',
} as const;

export type CompareView = (typeof COMPARE_VIEW)[keyof typeof COMPARE_VIEW];

interface StartOptions {
  /**
   * 유입 경로 (딥링크·입력창·히스토리·프리셋).
   *
   * 확정된 job 생성 API의 request body에는 url만 있어서 서버로 보내지 않는다.
   * GA 이벤트 파라미터로 쓸 값이며, GA 연동(9단계) 전까지는 아무 데도 소비되지 않는다.
   */
  source?: CompareEntrySource;
}

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
  /** 서버가 준 실패 사유 문구. 실패가 아니면 null */
  errorMessage: string | null;
  /** 없는 jobId로 조회한 경우 — 만료 안내로 분기하기 위해 일반 오류와 구분한다 */
  isJobMissing: boolean;
  start: (url: string, options?: StartOptions) => void;
  /** 결과·에러 화면을 닫고 입력 화면으로 되돌린다 */
  reset: () => void;
}

/**
 * 가격 비교 한 건의 수명을 관리한다.
 *
 * job 생성 → jobId를 URL에 기록 → 상태 폴링 → 화면 구분까지를 이 훅이 담당한다.
 *  - 뷰는 `view`와 `stage`만 보고 무엇을 그릴지 정할 수 있음, 폴링 알 필요 X
 * - 나중에 폴링을 다른 방식으로 바꾸더라도 이 파일만 변경됨
 *
 * jobId를 URL에 두는 이유: 새로고침·뒤로가기·(공유)가 전부 URL 하나로 해결되기 때문.
 * 마운트 시 URL에 jobId가 있으면 그 job을 이어서 조회하므로 새로고침 복원 로직 불필요
 */
export const usePriceCompareJob = (): PriceCompareJob => {
  const [searchParams, setSearchParams] = useSearchParams();
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

  // job 생성 실패(400 등)와 상태 조회 실패를 같은 자리에서 다룬다.
  // - job 생성이 실패하면 URL에 jobId가 없어 입력 화면으로 되돌아감
  // - 이때 아무런 피드백이 없으면 사용자는 요청이 어떻게 진행되었는지 알 수 없으므로 예외처리 필요
  const jobRequestError = jobCreateError ?? jobStatusError;

  /** /?tab-compare&jobId=nextJobId와 같이 URL 쿼리 스트링을 write */
  const writeJobId = useCallback(
    (nextJobId: string | null, replace: boolean) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (nextJobId) {
            next.set(COMPARE_JOB_ID_PARAM, nextJobId);
            next.delete(COMPARE_PRODUCT_URL_PARAM);
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

  const start = useCallback(
    (url: string, _options: StartOptions = {}) => {
      // 비로그인이면 로그인 화면으로 보낸다.
      // 이때 로그인 후 복귀할 경로에 상품 URL을 넣어, 돌아왔을 때 비교 탭 입력창에 그 값이 복원되도록 한다
      // 게이트는 기본적으로 게이트가 열린 시점의 주소를 복귀 경로로 저장하는데,
      // 사용자가 입력창에 붙여넣은 값은 React 상태에만 있고 주소(/?tab=compare)에는 없다.
      // 기본 동작에 맡기면 로그인 후 입력창이 빈 채로 돌아오므로 복귀 경로를 직접 만들어 넘긴다.
      const returnPath = `${ROUTES.HOME}?tab=compare&${COMPARE_PRODUCT_URL_PARAM}=${encodeURIComponent(url)}`;

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

  const reset = useCallback(() => {
    resetCreateJob();
    writeJobId(null, false);
  }, [resetCreateJob, writeJobId]);

  const view = resolveView({
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
    errorCode:
      data?.status === COMPARE_JOB_STATUS.FAILED
        ? data.errorCode
        : getServerErrorCode(jobRequestError),
    errorMessage:
      data?.status === COMPARE_JOB_STATUS.FAILED
        ? data.errorMessage
        : getServerErrorMessage(jobRequestError),
    isJobMissing: isCompareJobNotFound(jobStatusError),
    start,
    reset,
  };
};

interface ResolveViewParams {
  hasJobId: boolean;
  isCreatingJob: boolean;
  hasError: boolean;
  status: CompareJobStatus | undefined;
  productCount: number | undefined;
}

/** 화면 구분은 이 함수 하나에 모아 둔다 — 뷰에서 조건을 다시 조립하지 않는다 */
const resolveView = ({
  hasJobId,
  isCreatingJob,
  hasError,
  status,
  productCount,
}: ResolveViewParams): CompareView => {
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
