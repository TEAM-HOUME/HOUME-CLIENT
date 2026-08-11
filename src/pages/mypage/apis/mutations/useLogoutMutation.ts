import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import type { LogoutResponse } from '@pages/mypage/types/apis/auth';

import { ROUTES } from '@routes/paths';

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

  return useMutation<LogoutResponse, Error, void>({
    mutationFn: postLogout,
    onSettled: () => {
      useUserStore.getState().clearUser();
      queryClient.clear();
      // 로그아웃 시 sessionStorage까지 clear
      // sessionStorage는 origin+탭 단위로 관리되므로 다른 사이트/탭에는 영향 X
      sessionStorage.clear();
      navigate(ROUTES.HOME, { replace: true });
    },
  });
};
