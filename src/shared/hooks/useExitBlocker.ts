import { useCallback, useEffect, useRef } from 'react';

import { useBlocker, type BlockerFunction } from 'react-router-dom';

type NavigationHistoryAction = Parameters<BlockerFunction>[0]['historyAction'];

interface UseExitBlockerOptions {
  // exit 차단 활성화 여부. false면 useBlocker가 inactive 상태로 동작
  enabled: boolean;
  /**
   * blocker가 'blocked' 상태로 진입할 때마다 호출되는 콜백.
   * - proceed: 막혀있던 navigation을 진행 (ex: 사용자가 모달에서 '나가기' 선택 시)
   * - reset: blocked 상태 해제, 현재 페이지에 머무름 (ex: 모달에서 '계속하기' 선택 시)
   */
  onBlocked: (args: {
    proceed: () => void;
    reset: () => void;
    historyAction: NavigationHistoryAction;
  }) => void;
  /**
   * 차단 여부 상세 제어 함수
   * true 반환 시 차단, false 반환 시 통과
   * 미지정 시 enabled=true면 모든 navigation을 차단
   * (예: 같은 페이지 내 step 이동은 통과, 화이트리스트 라우트는 통과 등)
   */
  shouldBlockNavigation?: BlockerFunction;
}

/**
 * 페이지 이탈 가드 공용 훅
 * - NavBar 뒤로가기, 브라우저 뒤로가기/앞으로가기, 모바일 뒤로가기 swipe 모두 가로챔
 * - 새로고침/탭 닫기는 가로채지 않음 (필요해지면 beforeunload로 별도 처리하면 됨)
 */
export const useExitBlocker = ({
  enabled,
  onBlocked,
  shouldBlockNavigation,
}: UseExitBlockerOptions) => {
  // 호출부에서 inline 함수를 넘겨도 useBlocker가 매 렌더 재등록되지 않도록 ref 적용
  const onBlockedRef = useRef(onBlocked);
  const shouldBlockNavigationRef = useRef(shouldBlockNavigation);
  const lastHistoryActionRef = useRef<NavigationHistoryAction | undefined>(
    undefined
  );

  // 매 렌더마다 ref를 최신 콜백으로 동기화
  useEffect(() => {
    onBlockedRef.current = onBlocked;
  }, [onBlocked]);

  useEffect(() => {
    shouldBlockNavigationRef.current = shouldBlockNavigation;
  }, [shouldBlockNavigation]);

  // blockerFn은 enabled가 바뀔 때만 새로 생성 → useBlocker가 enabled 토글을 즉시 인식
  const blockerFn = useCallback<BlockerFunction>(
    (args) => {
      if (!enabled) return false;
      lastHistoryActionRef.current = args.historyAction;
      return shouldBlockNavigationRef.current
        ? shouldBlockNavigationRef.current(args)
        : true;
    },
    [enabled]
  );

  // React Router Data API의 blocker 상태 머신 ('unblocked' | 'blocked' | 'proceeding')
  const blocker = useBlocker(blockerFn);

  // cleanup에서 항상 최신 blocker를 참조하도록 ref로 추적 (클로저 문제 해결)
  // (deps 빈 useEffect에서 cleanup 호출 시 첫 렌더의 blocker만 캡처되어 stuck 가능)
  const blockerRef = useRef(blocker);
  useEffect(() => {
    blockerRef.current = blocker;
  }, [blocker]);

  // blocker가 'blocked' 상태로 진입하는 순간 onBlocked 콜백 실행 (모달 표시 등)
  // deps를 blocker.state로 두어 객체 참조만 바뀌고 state가 동일한 경우 중복 호출되지 않도록 함
  useEffect(() => {
    if (blocker.state === 'blocked') {
      onBlockedRef.current({
        // react-router가 blocked 상태마다 새로 만들어 주는 함수라 this 바인딩이 없다.
        // 타입 선언이 메서드 형태여서 unbound-method가 오탐한다
        /* eslint-disable-next-line @typescript-eslint/unbound-method */
        proceed: blocker.proceed,
        /* eslint-disable-next-line @typescript-eslint/unbound-method */
        reset: blocker.reset,
        historyAction: lastHistoryActionRef.current!,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocker.state]);

  // 모달이 떠 있는 상태로 컴포넌트 언마운트 시 blocker가 stuck되는 것 방지
  // (이후 다른 페이지의 navigation까지 모두 막힐 수 있음)
  useEffect(() => {
    return () => {
      if (blockerRef.current.state === 'blocked') blockerRef.current.reset();
    };
  }, []);

  return blocker;
};
