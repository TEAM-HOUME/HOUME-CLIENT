import { useEffect } from 'react';

import { useLocation } from 'react-router-dom';

// 모든 상황(초기 로드, 라우트/쿼리/해시/키 변화)에서 스크롤을 최상단으로 초기화
export const useScrollToTop = () => {
  const location = useLocation();

  // 브라우저의 기본 스크롤 복원 기능을 1회 비활성화
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'scrollRestoration' in window.history
    ) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // 내비게이션 변경 시 항상 최상단으로 스크롤 이동
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [location.key, location.pathname, location.search, location.hash]);
};
