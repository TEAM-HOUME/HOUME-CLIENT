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
 * const result = await logout();
 * console.log(result.message); // "로그아웃되었습니다"
 * ```
 */
import { API_ENDPOINT } from '@constants/apiEndpoints';
import type { LogoutResponse } from '../types/auth';
import { HTTPMethod, request } from '@/shared/apis/request';

export const postLogout = async (): Promise<LogoutResponse> => {
  return request({
    method: HTTPMethod.POST,
    url: API_ENDPOINT.AUTH.LOGOUT,
  });
};
