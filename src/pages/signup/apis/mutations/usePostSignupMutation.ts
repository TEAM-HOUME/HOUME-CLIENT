import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@routes/paths';

import { useUserStore } from '@store/useUserStore';

import { TOAST_TYPE } from '@shared/types/toast';

import { HTTPMethod, request } from '@apis/config/request';

import { useToast } from '@components/toast/useToast';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { RESPONSE_MESSAGE, HTTP_STATUS } from '@constants/response';

import { consumeLoginRedirect } from '@utils/loginRedirect';

import type { SignupRequest, SignupResponse } from '../../types/apis/signup';

export const postSignup = async (
  data: SignupRequest
): Promise<SignupResponse> => {
  const response = await request<string>({
    method: HTTPMethod.POST,
    url: API_ENDPOINT.USER.SIGN_UP,
    body: data,
    rawResponse: true,
  });

  const accessToken = response.headers['access-token'];
  if (!accessToken) {
    throw new Error(
      RESPONSE_MESSAGE[HTTP_STATUS.UNAUTHORIZED] || '액세스 토큰이 없습니다.'
    );
  }

  return {
    userName: response.data.data,
    accessToken,
  };
};

export const usePostSignupMutation = () => {
  const navigate = useNavigate();
  const { notify } = useToast();
  const setUserName = useUserStore((state) => state.setUserName);
  const setAccessToken = useUserStore((state) => state.setAccessToken);

  return useMutation<SignupResponse, Error, SignupRequest>({
    mutationFn: postSignup,
    retry: false,
    onSuccess: (response) => {
      setUserName(response.userName);
      setAccessToken(response.accessToken);
      sessionStorage.removeItem('signupToken');
      navigate(ROUTES.WELCOME);
    },
    onError: (error) => {
      console.error('[usePostSignupMutation] 회원가입 실패:', error);

      // 가입 실패 시 시작점 복귀 + 에러 토스트
      navigate(consumeLoginRedirect() ?? ROUTES.HOME);
      notify({
        text: '회원가입이 완료되지 않았습니다',
        type: TOAST_TYPE.WARNING,
      });
    },
  });
};
