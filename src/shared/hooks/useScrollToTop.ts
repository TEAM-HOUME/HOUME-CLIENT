import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface Options {
  includeHash?: boolean; // 기본값 false: 앵커(해시) 내비게이션은 브라우저 기본 동작 유지
  includeKey?: boolean; // 기본값 false: location.key 변화에는 반응하지 않음
}

export const useScrollToTop = ({
  includeHash = false,
  includeKey = false,
}: Options = {}) => {
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
  }, [
    location.pathname,
    location.search,
    includeHash ? location.hash : undefined,
    includeKey ? location.key : undefined,
  ]);
};
