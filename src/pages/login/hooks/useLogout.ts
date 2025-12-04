/**
 * 로그아웃 React Query 훅
 *
 * 사용자 로그아웃을 처리하는 TanStack Query mutation 훅입니다.
 * 로그아웃 성공/실패와 관계없이 로컬 스토리지를 정리하고 홈페이지로 이동합니다.
 *
 * @returns {UseMutationResult<LogoutResponse, Error, void>} 로그아웃 상태와 함수를 반환
 *
 */
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { queryClient } from '@/shared/apis/queryClient';
import { useUserStore } from '@/store/useUserStore';

import { postLogout } from '../apis/logout';

import type { LogoutResponse } from '../types/auth';

export const useLogout = () => {
  const navigate = useNavigate();

  return useMutation<LogoutResponse, Error, void>({
    mutationFn: postLogout, // 로그아웃 API 호출 함수
    // 로그아웃 성공 시 실행되는 함수
    onSuccess: () => {
      console.log('[useLogout] 로그아웃 성공');

      // 액세스 토큰 제거
      useUserStore.getState().clearUser();
      // React Query 캐시 전체 정리
      queryClient.clear();

      navigate('/');
    },
    // 로그아웃 실패 시 실행되는 함수
    onError: (error) => {
      console.error('[useLogout] 로그아웃 실패:', error);

      // 에러가 발생해도 로컬 토큰은 제거하고 로그인 페이지로 이동
      useUserStore.getState().clearUser();
      // React Query 캐시 전체 정리
      queryClient.clear();
      navigate('/');
    },
  });
};
