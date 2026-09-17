import { useCallback, useEffect } from 'react';

import { useCreateCompareJobMutation } from '@pages/home/apis/mutations/useCreateCompareJobMutation';
import { useCompareJobStatusQuery } from '@pages/home/apis/queries/useCompareJobStatusQuery';
import {
  COMPARE_VIEW,
  type CompareView,
} from '@pages/home/constants/compareView';
import {
  COMPARE_JOB_STATUS,
  type CompareJobStatus,
} from '@pages/home/types/compare';
import {
  getServerErrorCode,
  getServerErrorMessage,
  isCompareJobNotFound,
} from '@pages/home/utils/compareJobError';

import { useCompareJobStore } from '@store/useCompareJobStore';

import { LOGIN_ENTRY_ROUTE } from '@analytics/params/gate';

import type {
  JobResultResponse,
  OriginalProductResponse,
  SourcesStatusResponse,
} from '@apis/__generated__/data-contracts';

import {
  COMPARE_JOB_ID_PARAM,
  COMPARE_PRODUCT_URL_PARAM,
} from '@constants/compareParams';

import { useLoginGate } from '@hooks/useLoginGate';

import {
  applyCompareTabParams,
  buildCompareTabPath,
} from '@utils/compareTabPath';

import type { SetURLSearchParams } from 'react-router-dom';

interface PriceCompareJob {
  jobId: string | null;
  /** 입력창에 채워둘 상품 URL. 딥링크 진입·로그인 복귀로 주소에 실려 온 값 */
  productUrl: string | null;
  view: CompareView;
  /** DONE일 때의 결과. 원본 상품 정보는 여기 없고 originalProduct에 따로 있다 */
  result: JobResultResponse | null;
  /**
   * 검색한 상품(원본 상품). 진행 중에도 온다.
   * 상태 응답이 오기 전(생성 직후 첫 폴링 전)에는 생성 응답의 title·thumbnail·price로 채워
   * 로딩 화면의 "검색한 상품" 카드가 생성 응답 즉시 그려지게 한다. 새로고침 복원처럼 생성 응답이 없으면 첫 폴링 응답부터 채워진다
   */
  originalProduct: OriginalProductResponse | null;
  /** 3개 소스(catalog·coupang·ebay)가 각각 어디까지 갔는지. 서버가 파이프라인 단계를 따로 주지 않아 진행 표시는 이 값으로만 가능하다 */
  sources: SourcesStatusResponse | null;
  /** 생성·조회 요청이 거절됐을 때의 서버 비즈니스 코드. job이 FAILED로 끝난 응답에는 코드가 없다 */
  errorCode: number | null;
  /** 실패했을 때 화면에 보여줄 완결된 문구. 실패가 아니면 null.
   * 서버 문구가 있으면 그걸, 없으면 이 훅이 job 사유(만료 등)에 맞는 기본 문구로 채운다 */
  errorMessage: string | null;
  start: (url: string) => void;
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
 * 히스토리는 job이 끝나도 여기서 무효화하지 않는다. 히스토리 쿼리가 staleTime 0이라
 * 검색 화면(CompareSearch)이 다시 마운트될 때 알아서 새로 받는다.
 *
 * searchParams/setSearchParams는 useCompareTab이 useSearchParams()를 한 번만 호출해 내려준다.
 * 이 훅이 따로 useSearchParams()를 부르면 useComparePreset과 서로 다른 스냅샷을 들고 있게 되어,
 * 같은 틱에서 두 훅이 연달아 setSearchParams를 호출할 때 나중 호출이 앞의 변경을 덮어쓸 수 있다.
 */
export const usePriceCompareJob = (
  searchParams: URLSearchParams,
  setSearchParams: SetURLSearchParams
): PriceCompareJob => {
  const jobId = searchParams.get(COMPARE_JOB_ID_PARAM);
  const productUrl = searchParams.get(COMPARE_PRODUCT_URL_PARAM);

  const { requireLogin } = useLoginGate();
  const {
    mutate: createJob,
    data: createdJob,
    isPending: isCreatingJob,
    error: jobCreateError,
    reset: resetCreateJob,
  } = useCreateCompareJobMutation();
  const { data, error: jobStatusError } = useCompareJobStatusQuery(jobId);
  const setActiveJobId = useCompareJobStore((state) => state.setActiveJobId);

  // 주소의 job이 진행 중이면 전역 스토어에 올린다 — 새로고침·공유 링크·뒤로가기로 들어온 job도 다른 화면에서 완료 토스트를 받는다.
  // 끝난 job은 CompareJobWatcher(routes/)가 스토어에서 비우므로 여기서는 올리기만 한다
  useEffect(() => {
    if (!jobId) return;
    if (
      data?.status === COMPARE_JOB_STATUS.PENDING ||
      data?.status === COMPARE_JOB_STATUS.RUNNING
    ) {
      setActiveJobId(jobId);
    }
  }, [jobId, data?.status, setActiveJobId]);

  // job 생성 실패(원본 페이지 로드 실패 502 등)와 상태 조회 실패를 같은 자리에서 다룬다.
  // - job 생성이 실패하면 URL에 jobId가 없어 입력 화면으로 되돌아감
  // - 이때 아무런 피드백이 없으면 사용자는 요청이 어떻게 진행되었는지 알 수 없으므로 예외처리 필요
  const jobRequestError = jobCreateError ?? jobStatusError;

  /** /?tab=compare&jobId=nextJobId로 URL을 쓴다. productUrl·presetId는 함께 지워진다 (applyCompareTabParams) */
  const writeJobId = useCallback(
    (nextJobId: string, replace: boolean) => {
      setSearchParams(
        (prev) => applyCompareTabParams(prev, { jobId: nextJobId }),
        {
          replace,
        }
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
      const returnPath = buildCompareTabPath({ productUrl: url });

      requireLogin(
        () => {
          createJob(
            { url },
            // jobId는 항상 replace로 쓴다. 뒤로가기 목적지는 이 시점 이전 항목 (입력창에서 제출했으면 입력 화면, 딥링크로 들어왔으면 직전에 보던 사이트)이어야 한다
            {
              onSuccess: (response) => {
                // 생성 타입은 jobId가 optional이지만 202 응답에는 항상 온다(실측). 없으면 진행할 수 없으니 입력 화면에 남긴다
                if (!response.jobId) return;
                // 첫 폴링 응답 전에 다른 화면으로 가도 지켜볼 수 있게 생성 즉시 올린다. 진행 중이던 이전 job은 덮어쓴다
                setActiveJobId(response.jobId);
                writeJobId(response.jobId, true);
              },
            }
          );
        },
        LOGIN_ENTRY_ROUTE.COMPARE_SEARCH,
        returnPath
      );
    },
    [createJob, requireLogin, setActiveJobId, writeJobId]
  );

  const dismissCreateError = useCallback(() => {
    resetCreateJob();
  }, [resetCreateJob]);

  const isJobFailed = data?.status === COMPARE_JOB_STATUS.FAILED;
  // 실패 문구를 보여줄 상황 전체 — job이 FAILED로 끝났거나, 생성·조회 요청이 거절됐거나
  const hasJobError = isJobFailed || Boolean(jobRequestError);

  const view = resolveJobView({
    hasJobId: Boolean(jobId),
    isCreatingJob,
    hasRequestError: Boolean(jobRequestError),
    status: data?.status,
    // 0건 판정은 프리셋과 같이 totalCount로 한다 (similarProducts는 일부만 올 수 있다는 프리셋 명세와 맞춤)
    productCount:
      data?.status === COMPARE_JOB_STATUS.DONE
        ? (data.result.totalCount ?? data.result.similarProducts?.length ?? 0)
        : undefined,
  });

  // 생성 응답은 방금 만든 job의 것일 때만 쓴다. 뒤로가기 등으로 URL의 jobId가 다른 job이면 그 job의 상태 응답만 믿는다
  const createdOriginalProduct: OriginalProductResponse | null =
    createdJob && createdJob.jobId === jobId
      ? {
          title: createdJob.title,
          imageUrl: createdJob.thumbnail,
          price: createdJob.price ?? undefined,
        }
      : null;

  return {
    jobId,
    productUrl,
    view,
    result: data?.status === COMPARE_JOB_STATUS.DONE ? data.result : null,
    originalProduct: data?.originalProduct ?? createdOriginalProduct,
    sources: data?.sources ?? null,
    // FAILED 응답에는 코드·문구가 없다(2026-09-17 실측). 요청 자체가 거절된 경우의 서버 코드·문구만 꺼낸다
    errorCode: getServerErrorCode(jobRequestError),
    errorMessage: resolveJobErrorMessage({
      hasError: hasJobError,
      isJobMissing: isCompareJobNotFound(jobStatusError),
      serverMessage: getServerErrorMessage(jobRequestError),
    }),
    start,
    dismissCreateError,
  };
};

interface ResolveJobViewParams {
  hasJobId: boolean;
  isCreatingJob: boolean;
  /** 생성·조회 요청 자체가 거절됨. job이 FAILED로 끝난 경우는 status로 본다 */
  hasRequestError: boolean;
  status: CompareJobStatus | undefined;
  productCount: number | undefined;
}

/** job 화면 구분은 이 함수 하나에 모아 둔다 — 뷰에서 조건을 다시 조립하지 않는다 */
const resolveJobView = ({
  hasJobId,
  isCreatingJob,
  hasRequestError,
  status,
  productCount,
}: ResolveJobViewParams): CompareView => {
  if (isCreatingJob) return COMPARE_VIEW.LOADING;

  // 생성 실패는 jobId가 없는 상태로 발생하므로 입력 화면 판정보다 먼저 본다
  if (hasRequestError) return COMPARE_VIEW.ERROR;
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
