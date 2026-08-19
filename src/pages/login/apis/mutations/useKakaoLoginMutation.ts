import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { resolveLoginToasterId } from '@pages/login/utils/resolveLoginToasterId';

import { ROUTES } from '@routes/paths';

import { useUserStore } from '@store/useUserStore';

import { TOAST_TYPE } from '@shared/types/toast';

import { GA_EVENTS } from '@analytics/events';
import { GA_TOAST_TYPE } from '@analytics/params/toast';
import { trackEvent } from '@analytics/track';
import { clearLoginEntryRoute } from '@analytics/utils/loginEntryRoute/storeLoginEntryRoute';
import { loginStatusParams } from '@analytics/utils/loginStatus';
import { resolveScreenName } from '@analytics/utils/screenName/resolveScreenName';

import { readAccessTokenHeader } from '@apis/config/accessTokenHeader';
import { HTTPMethod, request } from '@apis/config/request';

import { useToast } from '@components/toast/useToast';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { RESPONSE_MESSAGE, HTTP_STATUS } from '@constants/response';
import { TOAST_MESSAGE } from '@constants/toastMessage';

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

  const accessToken = readAccessTokenHeader(response);
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
  const { notify } = useToast();
  const setAccessToken = useUserStore((state) => state.setAccessToken);

  return useMutation<
    LoginApiResponse,
    Error,
    { code: string; env: AuthEnvironment }
  >({
    mutationFn: ({ code, env }) => getKakaoOAuthCallback(code, env),
    // 카카오 로그인 성공
    onSuccess: (response) => {
      // 신규회원 카카오 로그인 성공 시 자체 회원가입 페이지로 이동
      if (response.data.isNewUser) {
        // signupToken: 카카오 인증 통과 ~ 자체 회원가입 사이
        // 자체 회원가입 시 signupToken 사용
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
          // OAuth callback 페이지가 history에 남지 않도록 replace 사용
          // replace가 없을 시 signup 페이지에서 뒤로가기 했을 때 callback 재진입 -> kakao oauth callback mutation이 재실행됨
          replace: true,
        });
        return;
      }

      // 기존 회원: access-token 헤더로 카카오 로그인 완료
      if (response.accessToken) {
        setAccessToken(response.accessToken);
      }

      // 기존회원 카카오 로그인 성공 시 시작점 복귀 + 토스트
      // OAuth callback 페이지가 history에 남지 않도록 replace 사용
      // replace가 없을 시 시작점에서 뒤로가기 했을 때 callback 재진입 -> kakao oauth callback mutation이 재실행됨
      const destination = consumeLoginRedirect() ?? ROUTES.HOME;
      navigate(destination, { replace: true });
      clearLoginEntryRoute();
      notify({
        text: TOAST_MESSAGE.LOGIN_SUCCESS,
        type: TOAST_TYPE.SUCCESS,
        // 복귀 페이지에 바텀시트가 있으면 상단, 없으면 하단에 토스트 표시
        options: { toasterId: resolveLoginToasterId(destination) },
      });
    },
    // 카카오 로그인 실패
    onError: (error) => {
      console.error('[useKakaoLoginMutation] login error:', error);

      // 카카오 로그인 실패 시 시작점 복귀 + 토스트
      // onSuccess와 동일하게 replace: true -> callback 페이지가 history에 남아 뒤로가기 시 callback 재진입했을 떄 mutation 재실행되는 문제 차단
      const destination = consumeLoginRedirect() ?? ROUTES.HOME;
      trackEvent(GA_EVENTS.loginSocial.TOAST_LOGIN_ERROR_VIEW, {
        screen_name: resolveScreenName(destination),
        ...loginStatusParams(),
        toast_type: GA_TOAST_TYPE.LOGIN_FAIL,
        error_code: error.message,
      });
      navigate(destination, { replace: true });
      clearLoginEntryRoute();
      notify({
        text: TOAST_MESSAGE.LOGIN_ERROR,
        type: TOAST_TYPE.ERROR,
        // 성공 토스트와 동일하게 복귀 페이지 바텀시트 유무에 따라 위치 결정
        options: { toasterId: resolveLoginToasterId(destination) },
      });
    },
  });
};
