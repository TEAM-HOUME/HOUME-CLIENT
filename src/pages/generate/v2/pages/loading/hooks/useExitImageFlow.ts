import { useCallback } from 'react';

import { useGenerateStore } from '@pages/generate/v2/stores/useGenerateStore';

import { useFunnelStore } from '@store/useFunnelStore';
import { useImageFlowStore } from '@store/useImageFlowStore';

/**
 * 이미지 생성 플로우 이탈 시 store cleanup 모음
 * LoadingPage에서 사용자가 mutation 응답 전에 빠져나가는 경우 실행
 * 추후 state machine 패턴 도입 시 그대로 transition action으로 옮길 수 있도록
 * 호출 지점이 아닌 별도 모듈로 관리
 */
export const useExitImageFlow = () => {
  const resetGenerate = useGenerateStore((s) => s.resetGenerate);

  return useCallback(() => {
    useFunnelStore.getState().reset();
    useImageFlowStore.getState().reset();
    resetGenerate();
  }, [resetGenerate]);
};
