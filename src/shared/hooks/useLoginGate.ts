import { useCallback } from 'react';

import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@routes/paths';

import { useUserStore } from '@store/useUserStore';

import type { LoginEntryRoute } from '@analytics/params/gate';
import {
  clearLoginEntryRoute,
  persistLoginEntryRoute,
} from '@analytics/utils/loginEntryRoute/storeLoginEntryRoute';

import { setLoginRedirect } from '@utils/loginRedirect';

/**
 * 로그인 게이트 진입 관리 훅
 * - 로그인 상태면 action 실행
 * - 비로그인이면 현재 경로를 저장하고 로그인 페이지로 이동 (로그인 성공 후 consumeLoginRedirect로 복귀)
 *
 * useLocation을 구독하면 네비게이션마다 카드 N개가 전부 리렌더되는데, 경로는 클릭 순간에만 필요하므로 구독 불필요 -> useLocation 대신 window.location으로 읽기
 */
export const useLoginGate = () => {
  const navigate = useNavigate();

  const requireLogin = useCallback(
    (
      action: () => void,
      entryRoute?: LoginEntryRoute,
      /** 로그인 후 복귀할 경로. 생략하면 현재 주소로 돌아온다.
       *  현재 주소에 없는 값(사용자가 입력창에 입력한 값 등)을 복귀 시 살려야 할 때 넘긴다. ex) 가격비교탭에서 사용자가 입력창에 입력한 값을 URL 쿼리에 넣어 복귀해야 할 때 */
      redirectPath?: string
    ) => {
      const isLoggedIn = !!useUserStore.getState().accessToken;

      if (!isLoggedIn) {
        setLoginRedirect(
          redirectPath ?? window.location.pathname + window.location.search
        );
        if (entryRoute) {
          persistLoginEntryRoute(entryRoute);
        } else {
          clearLoginEntryRoute();
        }
        navigate(ROUTES.LOGIN);
        return;
      }

      action();
    },
    [navigate]
  );

  return { requireLogin };
};
