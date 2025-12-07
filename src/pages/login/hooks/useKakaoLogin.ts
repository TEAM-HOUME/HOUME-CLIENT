/**
 * 카카오 로그인 React Query 훅
 *
 * 카카오 OAuth 로그인을 처리하는 TanStack Query mutation 훅입니다.
 * 로그인 성공 시 액세스 토큰을 로컬 스토리지에 저장하고 홈페이지로 이동합니다.
 *
 * @returns useMutation - 로그인 상태와 함수를 반환
 *
 * @example
 * ```typescript
 * const { mutate: login, isPending, isError } = useKakaoLoginMutation();
 *
 * // 카카오 인가 코드와 환경 정보로 로그인
 * login({ code: 'authorization_code', env: 'local' });
 * ```
 */
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/routes/paths';
import { useUserStore } from '@/store/useUserStore';

import { getKakaoLogin } from '../apis/kakaoLogin';

import type { LoginApiResponse } from '../types/auth';

export const useKakaoLoginMutation = () => {
  const navigate = useNavigate();
  const setAccessToken = useUserStore((state) => state.setAccessToken);

  return useMutation<LoginApiResponse, Error, { code: string; env: string }>({
    mutationFn: ({ code, env }) => getKakaoLogin(code, env),
    onSuccess: (response) => {
      const accessToken = response.accessToken;

      // zustand에 저장 (localStorage 동시 저장)
      setAccessToken(accessToken);

      // 가입 여부에 따라 리다이렉트 (response.data가 true면 신규회원, false면 기존회원)
      if (response.data) {
        navigate(ROUTES.SIGNUP);
      } else {
        navigate(ROUTES.HOME);
      }
    },
    onError: () => {
      // 오류 처리는 KakaoCallback 컴포넌트에서 useErrorHandler로 처리
    },
  });
};
