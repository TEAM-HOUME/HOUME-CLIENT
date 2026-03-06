import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@routes/paths';

import { useUserStore } from '@store/useUserStore';

import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { RESPONSE_MESSAGE, HTTP_STATUS } from '@constants/response';

import { consumeLoginRedirect } from '@utils/loginRedirect';

import type { KakaoLoginResponse, LoginApiResponse } from '../../types/auth';
import type { AuthEnvironment } from '../../types/environment';

export const getKakaoOAuthCallback = async (
  code: string,
  env: AuthEnvironment
): Promise<LoginApiResponse> => {
  const response = await request<KakaoLoginResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.AUTH.KAKAO_CALLBACK,
    query: { code, env },
    rawResponse: true,
  });

  const data = response.data.data;

  const accessToken = response.headers['access-token'];
  if (!data.isNewUser && !accessToken) {
    throw new Error(
      RESPONSE_MESSAGE[HTTP_STATUS.UNAUTHORIZED] || '액세스 토큰이 없습니다.'
    );
  }

  if (data.isNewUser && !data.signupToken) {
    throw new Error(
      RESPONSE_MESSAGE[HTTP_STATUS.BAD_REQUEST] ||
        '회원가입 임시 토큰(signupToken)이 없습니다.'
    );
  }

  return {
    data,
    accessToken: accessToken || undefined,
  };
};

export const useKakaoLoginMutation = () => {
  const navigate = useNavigate();
  const setAccessToken = useUserStore((state) => state.setAccessToken);

  return useMutation<
    LoginApiResponse,
    Error,
    { code: string; env: AuthEnvironment }
  >({
    mutationFn: ({ code, env }) => getKakaoOAuthCallback(code, env),
    onSuccess: (response) => {
      // 신규 회원: signupToken 기반으로 회원가입 진행
      if (response.data.isNewUser) {
        const signupToken = response.data.signupToken;
        if (!signupToken) {
          console.error(
            '[useKakaoLoginMutation] 신규 회원 응답에 signupToken이 없습니다.'
          );
          return;
        }

        sessionStorage.setItem('signupToken', signupToken);

        navigate(ROUTES.SIGNUP, {
          state: {
            signupToken,
            prefill: response.data.prefill,
          },
        });
        return;
      }

      // 기존 회원: access-token 헤더로 로그인 완료
      if (response.accessToken) {
        setAccessToken(response.accessToken);
      }

      // 로그인 성공 시 시작점 복귀
      navigate(consumeLoginRedirect() ?? ROUTES.HOME);
    },
  });
};
