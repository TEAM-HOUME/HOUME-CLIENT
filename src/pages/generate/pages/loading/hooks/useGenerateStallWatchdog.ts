import { useEffect, useRef } from 'react';

import { PROGRESS_CONFIG } from '@pages/generate/constants/progressConfig';

import { reportMessage } from '@shared/monitoring/report';
import { MONITORING_SCOPE } from '@shared/monitoring/scope';

/**
 * 이미지 생성이 정지했다고 판정하는 시간 (ms)
 *
 * 진행바 예상 소요(PROGRESS_CONFIG.TOTAL_TIME = 27초)의 3배.
 * 정상 생성이 이보다 오래 걸리면 오탐이 되므로, 배포 후 실제 소요 시간 분포를 보고 조정한다.
 */
const STALL_TIMEOUT_MS = PROGRESS_CONFIG.TOTAL_TIME * 3;

interface UseGenerateStallWatchdogParams {
  /** 생성 요청이 실제로 나간 경우에만 감시한다 */
  enabled: boolean;
  isApiCompleted: boolean;
  hasNavigationData: boolean;
  /** 정지로 판정됐을 때 사용자를 빼내는 처리 (토스트 + 홈 이동) */
  onStall: () => void;
}

/**
 * 이미지 생성이 끝나지 않아 화면에 갇히는 것을 감지하고 빠져나오게 한다
 *
 * 두 가지 정지가 실제로 발생, 문제 재현 X
 * - `isApiCompleted`가 오지 않아 진행바가 90%에서 멈춤 (mutation이 응답하지 않음)
 * - 진행바는 100%인데 `navigationData`가 없어 이동하지 못함
 *
 * 후자는 `ProgressBar`가 완료를 한 번만 처리하기 때문에 회복 수단이 없다.
 * 둘 다 아무 이벤트도 발생시키지 않아 관측되지 않았고, 사용자는 나가려면 이탈 팝업을
 * 통과해야 하는데 그러면 퍼널 입력이 전부 삭제된다(크레딧은 이미 소모된 상태).
 *
 * 그래서 시간을 기준으로 판정한다. 어느 쪽 정지였는지는 전송하는
 * `is_api_completed`·`has_navigation_data`로 구분한다.
 */
export const useGenerateStallWatchdog = ({
  enabled,
  isApiCompleted,
  hasNavigationData,
  onStall,
}: UseGenerateStallWatchdogParams): void => {
  // 타이머는 마운트 시 한 번만 걸어야 한다. 값이 바뀔 때마다 다시 걸면 정지를 영원히 감지하지 못한다.
  // 그래서 최신 값은 ref로만 읽는다.
  const isApiCompletedRef = useRef(isApiCompleted);
  const hasNavigationDataRef = useRef(hasNavigationData);
  const onStallRef = useRef(onStall);

  useEffect(() => {
    isApiCompletedRef.current = isApiCompleted;
    hasNavigationDataRef.current = hasNavigationData;
    onStallRef.current = onStall;
  }, [isApiCompleted, hasNavigationData, onStall]);

  useEffect(() => {
    if (!enabled) return;

    const timer = window.setTimeout(() => {
      reportMessage('image generation stalled', {
        scope: MONITORING_SCOPE.IMAGE_GENERATE,
        level: 'error',
        fingerprint: ['generate-stalled'],
        context: {
          elapsed_ms: STALL_TIMEOUT_MS,
          is_api_completed: isApiCompletedRef.current,
          has_navigation_data: hasNavigationDataRef.current,
        },
      });

      onStallRef.current();
    }, STALL_TIMEOUT_MS);

    // 정상 완료 시 결과 화면으로 이동하며 언마운트돼 여기서 타이머가 정리된다
    return () => window.clearTimeout(timer);
  }, [enabled]);
};
