import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@routes/paths';

import { useUserStore } from '@store/useUserStore';

import type { BaseResponse } from '@shared/types/apis';
import { TOAST_TYPE, TOASTER_ID } from '@shared/types/toast';

import { META_COMPLETE_REGISTRATION_PENDING_KEY } from '@analytics/metaPixel';

import type { SocialSignUpV2Request } from '@apis/__generated__/data-contracts';
import { readAccessTokenHeader } from '@apis/config/accessTokenHeader';
import { HTTPMethod, request } from '@apis/config/request';

import { useToast } from '@components/toast/useToast';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { RESPONSE_MESSAGE, HTTP_STATUS } from '@constants/response';
import { TOAST_MESSAGE } from '@constants/toastMessage';

import { consumeLoginRedirect } from '@utils/loginRedirect';

import type { SignupResponse } from '../../types/apis/signup';

export const postSignup = async (
  data: SocialSignUpV2Request
): Promise<SignupResponse> => {
  const response = await request<string>({
    method: HTTPMethod.POST,
    url: API_ENDPOINT.USER.SIGN_UP_V2,
    body: data,
    rawResponse: true,
  });

  const accessToken = readAccessTokenHeader(response);
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

export const useSignupMutation = () => {
  const navigate = useNavigate();
  const { notify } = useToast();
  const setUserName = useUserStore((state) => state.setUserName);
  const setAccessToken = useUserStore((state) => state.setAccessToken);

  return useMutation<SignupResponse, Error, SocialSignUpV2Request>({
    mutationFn: postSignup,
    retry: false,
    onSuccess: (response) => {
      setUserName(response.userName);
      setAccessToken(response.accessToken);
      sessionStorage.removeItem('signupToken');
      sessionStorage.setItem(META_COMPLETE_REGISTRATION_PENDING_KEY, 'true');
      navigate(ROUTES.WELCOME);
      notify({
        text: TOAST_MESSAGE.SIGNUP_SUCCESS,
        type: TOAST_TYPE.SUCCESS,
        options: { toasterId: TOASTER_ID.TOP_4 },
      });
    },
    onError: (error) => {
      if (import.meta.env.DEV && isAxiosError<BaseResponse<unknown>>(error)) {
        console.error('[useSignupMutation] 회원가입 실패:', {
          status: error.response?.status,
          message: error.response?.data?.message,
          data: error.response?.data,
        });
      } else {
        console.error('[useSignupMutation] 회원가입 실패:', error);
      }

      // 가입 실패 시 시작점 복귀 + 에러 토스트
      navigate(consumeLoginRedirect() ?? ROUTES.HOME);
      notify({
        text: TOAST_MESSAGE.SIGNUP_ERROR,
        type: TOAST_TYPE.ERROR,
        options: { toasterId: TOASTER_ID.TOP_4 },
      });
    },
  });
};
