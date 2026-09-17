import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@routes/paths';

import { useCompareJobStore } from '@store/useCompareJobStore';
import { useUserStore } from '@store/useUserStore';

import { queryClient } from '@apis/config/queryClient';
import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';

export type DeleteUserResponse = string;

export const deleteUser = async (): Promise<DeleteUserResponse> => {
  return request<DeleteUserResponse>({
    method: HTTPMethod.DELETE,
    url: API_ENDPOINT.USER.DELETE,
  });
};

export const useDeleteUserMutation = () => {
  const navigate = useNavigate();

  return useMutation<DeleteUserResponse>({
    mutationFn: deleteUser,
    retry: false,
    onSuccess: () => {
      navigate(ROUTES.HOME, { replace: true });

      setTimeout(() => {
        useUserStore.getState().clearUser();
        // 로그아웃과 같은 이유로 진행 중인 비교 job을 비운다 (sessionStorage.clear()는 메모리 상태를 안 지운다)
        useCompareJobStore.getState().clearActiveJob();
        queryClient.clear();
        // 로그아웃과 동일하게 sessionStorage까지 정리 (origin+탭 단위라 다른 사이트/탭 영향 X)
        sessionStorage.clear();
      }, 100);
    },
  });
};
