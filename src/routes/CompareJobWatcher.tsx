import { useEffect } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { useCompareJobStatusQuery } from '@pages/home/apis/queries/useCompareJobStatusQuery';
import { COMPARE_JOB_STATUS } from '@pages/home/types/compare';

import { ROUTES } from '@routes/paths';

import { useCompareJobStore } from '@store/useCompareJobStore';

import { TOAST_TYPE, TOASTER_ID } from '@shared/types/toast';

import { useToast } from '@components/toast/useToast';

import { COMPARE_JOB_ID_PARAM, HOME_TAB_PARAM } from '@constants/compareParams';
import { TOAST_ACTION_LABEL, TOAST_MESSAGE } from '@constants/toastMessage';

import { buildCompareTabPath } from '@utils/compareTabPath';

/** 완료·실패 토스트가 떠 있는 시간. 기본값(2초)은 "보러가기"를 누르기에 짧다 */
const COMPARE_TOAST_DURATION_MS = 5_000;

/**
 * 진행 중인 비교 job을 어느 화면에서든 지켜보다가 끝나면 알린다. 화면은 없다.
 *
 * - 스토어(useCompareJobStore)에 jobId가 있는 동안 상태를 폴링한다
 * - DONE이면 완료 토스트("보러가기" → 비교 탭 결과 화면), FAILED면 실패 토스트("확인하기" → 비교 탭 에러 화면)
 * - 사용자가 이미 그 job의 비교 탭을 보고 있으면 토스트를 띄우지 않는다. 그 화면이 결과를 바로 그린다
 * - 어느 쪽이든 끝나면 스토어를 비운다. 조회 자체가 거절돼도(만료·로그아웃) 조용히 비운다
 *
 * routes/에 두는 이유: pages/home의 폴링 훅을 써야 하는데 shared/·store/는 pages/를 import할 수 없다.
 * 폴링 중복 방지: 비교 탭이 같은 job을 보고 있으면 그쪽 쿼리가 폴링하므로 여기서는 쉰다.
 * 같은 queryKey라 캐시는 공유돼 결과는 여기서도 즉시 본다.
 */
const CompareJobWatcher = () => {
  const activeJobId = useCompareJobStore((state) => state.activeJobId);
  const clearActiveJob = useCompareJobStore((state) => state.clearActiveJob);
  const location = useLocation();
  const navigate = useNavigate();
  const { notify } = useToast();

  const searchParams = new URLSearchParams(location.search);
  const isViewingActiveJob =
    activeJobId !== null &&
    location.pathname === ROUTES.HOME &&
    searchParams.get(HOME_TAB_PARAM) === 'compare' &&
    searchParams.get(COMPARE_JOB_ID_PARAM) === activeJobId;

  const { data, error } = useCompareJobStatusQuery(activeJobId, {
    polling: !isViewingActiveJob,
  });

  const status = data?.status;
  const isFinished =
    status === COMPARE_JOB_STATUS.DONE || status === COMPARE_JOB_STATUS.FAILED;
  const hasError = Boolean(error);

  useEffect(() => {
    if (activeJobId === null) return;
    if (!isFinished && !hasError) return;

    clearActiveJob();

    // 조회가 거절된 job(만료·로그아웃 뒤 403 등)은 알릴 내용이 없다
    if (hasError) return;
    // 그 job의 비교 탭을 보고 있으면 화면이 결과를 그린다. 토스트는 중복이다
    if (isViewingActiveJob) return;

    const goToJob = () => navigate(buildCompareTabPath({ jobId: activeJobId }));

    if (status === COMPARE_JOB_STATUS.DONE) {
      notify({
        type: TOAST_TYPE.ACTION,
        text: TOAST_MESSAGE.COMPARE_JOB_DONE,
        actionLabel: TOAST_ACTION_LABEL.VIEW,
        onClick: goToJob,
        options: {
          toasterId: TOASTER_ID.BOTTOM_4,
          duration: COMPARE_TOAST_DURATION_MS,
        },
      });
      return;
    }

    // FAILED — 비교 탭으로 가면 usePriceCompareJob이 같은 응답으로 에러 화면을 그린다
    notify({
      type: TOAST_TYPE.ACTION,
      text: TOAST_MESSAGE.COMPARE_JOB_FAILED,
      actionLabel: TOAST_ACTION_LABEL.CHECK,
      onClick: goToJob,
      options: {
        toasterId: TOASTER_ID.BOTTOM_4,
        duration: COMPARE_TOAST_DURATION_MS,
      },
    });
    // isViewingActiveJob은 "끝난 순간"의 위치만 보면 된다. deps에 넣으면 토스트가 뜬 뒤 이동할 때 다시 돌아
    // (그때는 이미 스토어가 비어 activeJobId가 null이라 return되지만) 의도가 흐려지므로 뺀다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeJobId,
    isFinished,
    hasError,
    status,
    clearActiveJob,
    navigate,
    notify,
  ]);

  return null;
};

export default CompareJobWatcher;
