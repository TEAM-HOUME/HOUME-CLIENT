import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINT } from '@constants/apiEndpoints';
import type { LogoutResponse } from '@pages/login/types/auth';
import { ROUTES } from '@/routes/paths';
import { useUserStore } from '@/store/useUserStore';
import { HTTPMethod, request } from '@/shared/apis/request';

/**
 * 로그아웃 API 함수
 *
 * 현재 로그인된 사용자의 세션을 종료합니다.
 * 서버에 로그아웃 요청을 보내고, 성공 시 서버에서 HTTP-only 쿠키를 제거합니다.
 *
 * @returns Promise<LogoutResponse> - 로그아웃 결과 메시지
 *
 * @example
 * ```typescript
 * const result = await postLogout();
 * console.log(result.message); // "로그아웃되었습니다"
 * ```
 */

export const postLogout = async (): Promise<LogoutResponse> => {
  return request<LogoutResponse>({
    method: HTTPMethod.POST,
    url: API_ENDPOINT.AUTH.LOGOUT,
  });
};

/**
 * 로그아웃 React Query 훅
 *
 * 사용자 로그아웃을 처리하는 TanStack Query mutation 훅입니다.
 * 로그아웃 성공/실패와 관계없이 로컬 스토리지를 정리하고 로그인 페이지로 이동합니다.
 *
 * @returns {UseMutationResult<LogoutResponse, Error, void>} 로그아웃 상태와 함수를 반환
 *
 */

export const useLogoutMutation = () => {
  const navigate = useNavigate();

  return useMutation<LogoutResponse, Error, void>({
    mutationFn: postLogout, // 로그아웃 API 호출 함수
    onSettled: () => {
      // 에러가 발생해도 로컬 토큰은 제거하고 로그인 페이지로 이동
      useUserStore.getState().clearUser();
      navigate(ROUTES.LOGIN);
    },
  });
};
