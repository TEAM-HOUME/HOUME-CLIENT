import type { LoginEntryRoute } from '@analytics/params/gate';

import { useLoginGate } from '@hooks/useLoginGate';

/**
 * 외부 상품 링크 이동의 SSOT
 * - 로그인 게이트를 통과한 뒤 새 탭으로 외부 상품 페이지를 연다
 * - 외부 URL이므로 새 탭(_blank) 유지: 같은 탭 내에서 외부 URL로 이동하면 SPA가 언로드되어 HOUME 컨텍스트가 소실됨
 */
export const useProductLink = () => {
  const { requireLogin } = useLoginGate();

  /**
   * @param href 외부 상품 URL
   * @param onBeforeOpen 로그인 게이트 통과 후 새 탭을 열기 직전 실행할 sideEffect (ex: GA 이벤트)
   */
  const openProductLink = (
    href?: string,
    onBeforeOpen?: () => void,
    entryRoute?: LoginEntryRoute
  ) => {
    if (!href || typeof window === 'undefined') return;

    requireLogin(() => {
      onBeforeOpen?.();
      window.open(href, '_blank', 'noopener,noreferrer');
    }, entryRoute);
  };

  return { openProductLink };
};
