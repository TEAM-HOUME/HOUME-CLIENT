import { API_ENDPOINT } from '@constants/apiEndpoints';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { SignupRequest, SignupResponse } from '../types/apis/signup';
import { HTTPMethod, request } from '@/shared/apis/request';
import { ROUTES } from '@/routes/paths';
import { useUserStore } from '@/store/useUserStore';

/* 회원가입 API 함수 */
export const patchSignup = async (
  data: SignupRequest
): Promise<SignupResponse> => {
  return request({
    method: HTTPMethod.PATCH,
    url: API_ENDPOINT.USER.SIGN_UP,
    body: data as unknown as Record<string, unknown>,
  });
};

/* 회원가입 TanStack Query 훅 */
export const usePatchSignup = () => {
  const navigate = useNavigate();
  const setUserName = useUserStore((state) => state.setUserName);

  return useMutation<SignupResponse, Error, SignupRequest>({
    mutationFn: patchSignup,
    retry: 3,
    onSuccess: (response) => {
      setUserName(response.data); // userName 전역 저장 (zustand)
      navigate(ROUTES.SIGNUPCOMPLETE); // 회원가입 완료 페이지 이동
    },
    onError: (error) => {
      console.error('[usePatchSignup] 회원가입 실패:', error); // 에러는 useErrorHandler에서 처리
    },
  });
};
