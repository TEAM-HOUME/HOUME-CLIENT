import { useEffect } from 'react';

import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { useCompareJobStatusQuery } from '@pages/home/apis/queries/useCompareJobStatusQuery';
import { COMPARE_JOB_STATUS } from '@pages/home/types/compare';
import { isCompareJobPermanentError } from '@pages/home/utils/compareJobError';

import { ROUTES } from '@routes/paths';

import { useCompareJobStore } from '@store/useCompareJobStore';

import {
  TOAST_ACTION_DURATION_MS,
  TOAST_TYPE,
  TOASTER_ID,
} from '@shared/types/toast';

import { useToast } from '@components/toast/useToast';

import { COMPARE_JOB_ID_PARAM, HOME_TAB_PARAM } from '@constants/compareParams';
import { TOAST_ACTION_LABEL, TOAST_MESSAGE } from '@constants/toastMessage';

import { buildCompareTabPath, parseHomeTab } from '@utils/compareTabPath';

interface ActiveCompareJobWatcherProps {
  jobId: string;
}

/**
 * 진행 중인 job 하나를 지켜본다. 스토어에 jobId가 있을 때만 마운트된다.
 *
 * - 상태를 폴링하다 DONE이면 완료 토스트("보러가기" → 비교 탭 결과 화면), FAILED면 실패 토스트("확인하기" → 비교 탭 에러 화면)
 * - 사용자가 이미 그 job의 비교 탭을 보고 있으면 토스트를 띄우지 않는다. 그 화면이 결과를 바로 그린다
 * - 끝나거나 조회가 영구히 거절되면(없는 job·인증 거절·세션 만료) 스토어를 비운다. 일시 오류(오프라인·5xx)는 계속 지켜본다
 *
 * 폴링 중복 방지: 비교 탭이 같은 job을 보고 있으면 그쪽 쿼리가 폴링하므로 여기서는 쉰다.
 * 같은 queryKey라 캐시는 공유돼 결과는 여기서도 즉시 본다.
 */
const ActiveCompareJobWatcher = ({ jobId }: ActiveCompareJobWatcherProps) => {
  const clearActiveJob = useCompareJobStore((state) => state.clearActiveJob);
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { notify } = useToast();

  const isViewingJob =
    pathname === ROUTES.HOME &&
    parseHomeTab(searchParams.get(HOME_TAB_PARAM)) === 'compare' &&
    searchParams.get(COMPARE_JOB_ID_PARAM) === jobId;

  const { data, error } = useCompareJobStatusQuery(jobId, {
    polling: !isViewingJob,
  });

  const status = data?.status;
  const isPermanentError = isCompareJobPermanentError(error);

  useEffect(() => {
    const isDone = status === COMPARE_JOB_STATUS.DONE;
    const isFailed = status === COMPARE_JOB_STATUS.FAILED;
    if (!isDone && !isFailed && !isPermanentError) return;

    clearActiveJob();

    // 조회가 영구히 거절된 job(만료 404, 로그아웃 뒤 403 등)은 알릴 내용이 없다
    if (isPermanentError) return;
    // 그 job의 비교 탭을 보고 있으면 화면이 결과를 그린다. 토스트는 중복이다
    if (isViewingJob) return;

    // FAILED여도 비교 탭으로 보내면 usePriceCompareJob이 같은 응답으로 에러 화면을 그린다
    notify({
      type: TOAST_TYPE.ACTION,
      text: isDone
        ? TOAST_MESSAGE.COMPARE_JOB_DONE
        : TOAST_MESSAGE.COMPARE_JOB_FAILED,
      actionLabel: isDone ? TOAST_ACTION_LABEL.VIEW : TOAST_ACTION_LABEL.CHECK,
      onClick: () => navigate(buildCompareTabPath({ jobId })),
      options: {
        toasterId: TOASTER_ID.BOTTOM_4,
        duration: TOAST_ACTION_DURATION_MS,
      },
    });
    // isViewingJob은 "끝난 순간"의 위치만 보면 된다. deps에 넣으면 토스트가 뜬 뒤 이동할 때 다시 돌아
    // (그때는 이미 스토어가 비어 이 컴포넌트가 언마운트되지만) 의도가 흐려지므로 뺀다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, status, isPermanentError, clearActiveJob, navigate, notify]);

  return null;
};

/**
 * 진행 중인 가격 비교 job을 어느 화면에서든 지켜보다가 끝나면 알린다. 화면은 없다.
 *
 * 스토어(useCompareJobStore)에 jobId가 있을 때만 ActiveCompareJobWatcher를 마운트한다 — 대부분의 세션은 job이 없으므로
 * 라우트가 바뀔 때마다 렌더되거나 비활성 쿼리 관찰자를 붙들고 있지 않게 한다.
 *
 * routes/에 두는 이유: pages/home의 폴링 훅을 써야 하는데 shared/·store/는 pages/를 import할 수 없다.
 */
const CompareJobWatcher = () => {
  const activeJobId = useCompareJobStore((state) => state.activeJobId);

  return activeJobId !== null ? (
    <ActiveCompareJobWatcher jobId={activeJobId} />
  ) : null;
};

export default CompareJobWatcher;
