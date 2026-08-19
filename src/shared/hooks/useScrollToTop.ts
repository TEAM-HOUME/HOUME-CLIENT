import { useEffect, useLayoutEffect, useRef } from 'react';

import {
  NavigationType,
  useLocation,
  useNavigationType,
} from 'react-router-dom';

/**
 * 네비게이션 스크롤 관리 훅
 *
 * - PUSH/REPLACE(앞으로 이동): 항상 최상단으로 스크롤 (새 페이지는 위에서 시작)
 * - POP(뒤로/앞으로 가기): 그 history 항목에서 떠나기 직전의 스크롤 위치로 복원
 *   예) mypage → resultPage → 뒤로가기 시 mypage의 원래 스크롤 높이로 복귀
 */
export const useScrollToTop = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  // history 항목(location.key)별 저장된 스크롤 위치
  const positionsRef = useRef<Map<string, number>>(new Map());
  // 직전 location.key (떠나는 페이지 식별용)
  const prevKeyRef = useRef(location.key);
  // 현재 페이지의 최신 스크롤 위치 (사용자 스크롤 추적)
  const latestScrollYRef = useRef(0);

  // 브라우저 기본 스크롤 복원 비활성화 (스크롤은 아래 로직으로 직접 관리)
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'scrollRestoration' in window.history
    ) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // 현재 페이지의 스크롤 위치를 최신값으로 추적
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      latestScrollYRef.current = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 이동 시: (1) 떠나는 페이지 위치 저장 → (2) 새 위치 스크롤 적용
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    // (1) location.key가 바뀐 직후 시점. 아직 새 페이지로 스크롤하기 전이라
    //     latestScrollYRef는 떠나는(직전) 페이지의 마지막 스크롤 위치를 담고 있음
    if (prevKeyRef.current !== location.key) {
      positionsRef.current.set(prevKeyRef.current, latestScrollYRef.current);
    }

    // (2) POP이면 저장 위치 복원, 그 외(PUSH/REPLACE)는 최상단.
    //     useLayoutEffect(페인트 전)라 '최상단 → 복원 위치' 점프 깜빡임 방지
    const target =
      navigationType === NavigationType.Pop
        ? (positionsRef.current.get(location.key) ?? 0)
        : 0;

    window.scrollTo({ top: target, left: 0, behavior: 'auto' });
    latestScrollYRef.current = target; // 방금 적용한 위치로 동기화 (스크롤 이벤트 레이스 방지)
    prevKeyRef.current = location.key;
  }, [location.key, navigationType]);
};
