/* 회원가입 TanStack Query 훅 */

import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/routes/paths';
import { useUserStore } from '@/store/useUserStore';

import { patchSignup } from '../apis/signup';

import type { SignupRequest, SignupResponse } from '../types/apis/signup';

export const usePatchSignup = () => {
  const navigate = useNavigate();
  const setUserName = useUserStore((state) => state.setUserName);

  return useMutation<SignupResponse, Error, SignupRequest>({
    mutationFn: patchSignup,
    retry: 3,
    // 회원가입 성공 시 실행되는 함수
    onSuccess: (response) => {
      // console.log('[usePatchSignup] 회원가입 성공:', response);
      // console.log(response.data);
      setUserName(response.data); // userName 전역 저장
      // 회원가입 완료 페이지 이동
      navigate(ROUTES.GENERATE_START);
    },
    // 회원가입 실패 시 실행되는 함수
    onError: (error) => {
      console.error('[usePatchSignup] 회원가입 실패:', error);
      // alert 제거 - useErrorHandler에서 처리하도록 위임
    },
  });
};
