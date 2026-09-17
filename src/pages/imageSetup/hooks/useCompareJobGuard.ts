import { useCallback } from 'react';

import { useNavigate } from 'react-router-dom';

import { useCompareJobStore } from '@store/useCompareJobStore';

import { TOAST_TYPE, TOASTER_ID } from '@shared/types/toast';

import { useToast } from '@components/toast/useToast';

import { TOAST_ACTION_LABEL, TOAST_MESSAGE } from '@constants/toastMessage';

import { buildCompareTabPath } from '@utils/compareTabPath';

/** 가드 토스트가 떠 있는 시간. 기본값(2초)은 "돌아가기"를 누르기에 짧다 */
const GUARD_TOAST_DURATION_MS = 5_000;

/**
 * 가격 비교가 진행 중이면 이미지 생성을 막는다.
 *
 * 기획: 공간 선택 퍼널 진입까지는 허용하고, 공간 선택 바텀시트의 "공간 선택하기"에서 막는다.
 * 그래서 startFlow 호출부(홈·배너·스타일 상세·상품 탭)에는 달지 않고 useFloorPlanSelect의 확인 핸들러 2곳에서 부른다.
 * 풀퍼널은 그 뒤 취향·활동 단계가 더 있어, 생성 요청 직전(useActivityInfo의 제출)에서 한 번 더 부른다.
 * "진행 중" 판정은 스토어에 jobId가 있는지로 한다 — 끝난 job은 CompareJobWatcher(routes/)가 스토어에서 비운다.
 *
 * 토스트는 상단(TOP_4)에 띄운다. 바텀시트가 하단을 가린다.
 */
export const useCompareJobGuard = () => {
  const activeJobId = useCompareJobStore((state) => state.activeJobId);
  const navigate = useNavigate();
  const { notify } = useToast();

  /** 진행 중인 비교가 있으면 안내 토스트를 띄우고 true를 돌려준다. 호출부는 true면 진행을 멈춘다 */
  const blockIfComparing = useCallback((): boolean => {
    if (activeJobId === null) return false;

    notify({
      type: TOAST_TYPE.ACTION,
      text: TOAST_MESSAGE.COMPARE_JOB_IN_PROGRESS,
      actionLabel: TOAST_ACTION_LABEL.GO_BACK,
      onClick: () => navigate(buildCompareTabPath({ jobId: activeJobId })),
      options: {
        toasterId: TOASTER_ID.TOP_4,
        duration: GUARD_TOAST_DURATION_MS,
      },
    });
    return true;
  }, [activeJobId, navigate, notify]);

  return { blockIfComparing };
};
