import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import type { LogoutResponse } from '@pages/mypage/types/apis/auth';

import { ROUTES } from '@routes/paths';

import { useCompareJobStore } from '@store/useCompareJobStore';
import { useUserStore } from '@store/useUserStore';

import { queryClient } from '@apis/config/queryClient';
import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';

export const postLogout = async (): Promise<LogoutResponse> => {
  return request<LogoutResponse>({
    method: HTTPMethod.POST,
    url: API_ENDPOINT.AUTH.LOGOUT,
  });
};

export const useLogoutMutation = () => {
  const navigate = useNavigate();

  return useMutation<LogoutResponse>({
    mutationFn: postLogout,
    onSettled: () => {
      useUserStore.getState().clearUser();
      // 진행 중인 비교 job은 이 계정의 것이라 더 지켜보지 않는다.
      // 아래 sessionStorage.clear()는 저장소만 지우고 메모리의 zustand 상태는 남기므로 스토어를 직접 비운다
      useCompareJobStore.getState().clearActiveJob();
      queryClient.clear();
      // 로그아웃 시 sessionStorage까지 clear
      // sessionStorage는 origin+탭 단위로 관리되므로 다른 사이트/탭에는 영향 X
      sessionStorage.clear();
      navigate(ROUTES.HOME, { replace: true });
    },
  });
};
