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
import axiosInstance from '@shared/apis/axiosInstance';
import type { LogoutResponse } from '../types/auth';

// AxiosInstance를 직접 사용해서 서버에 로그아웃 요청
export const postLogout = async (): Promise<LogoutResponse> => {
  // console.log('[logout] 로그아웃 요청 시작');

  try {
    const response = await axiosInstance.post<LogoutResponse>(
      API_ENDPOINT.AUTH.LOGOUT
    );

    // console.log('[logout] 응답 성공:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[logout] 요청 실패:', error.response?.data);
    console.error('[logout] 상태 코드:', error.response?.status);
    throw error;
  }
};
