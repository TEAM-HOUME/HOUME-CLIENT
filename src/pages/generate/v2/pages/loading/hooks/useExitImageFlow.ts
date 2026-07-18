import { useCallback } from 'react';

import { useGenerateStore } from '@pages/generate/v2/stores/useGenerateStore';

import { useImageFlowStore } from '@store/useImageFlowStore';

/**
 * 이미지 생성 플로우에서 빠져나올 때 정리 모음.
 * LoadingPage에서 생성 응답 전에 사용자가 나가는 경우 실행된다.
 */
export const useExitImageFlow = () => {
  const resetGenerate = useGenerateStore((s) => s.resetGenerate);

  return useCallback(() => {
    // 플로우를 완전히 끝낸다(flow·flowSnapshot·퍼널 데이터 모두 정리)
    useImageFlowStore.getState().abandonFlow();
    resetGenerate();
  }, [resetGenerate]);
};
