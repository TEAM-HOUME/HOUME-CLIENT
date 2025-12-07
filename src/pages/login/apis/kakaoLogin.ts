import { RESPONSE_MESSAGE, HTTP_STATUS } from '@/shared/constants/response';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import axiosInstance from '@shared/apis/axiosInstance';

import type { KakaoLoginResponse, LoginApiResponse } from '../types/auth';
import type { BaseResponse } from '@shared/types/apis';

/**
 * 카카오 OAuth 로그인 콜백 API 함수
 *
 * 카카오 인증 서버에서 받은 인가 코드(code)와 환경(env)을 백엔드 콜백 API로 전달합니다.
 * 백엔드는 인가 코드를 검증하고 사용자 정보와 액세스 토큰을 반환합니다.
 *
 * 이 함수는 KakaoCallback 컴포넌트에서 URL 파라미터로부터 파싱한 인가 코드와
 * 환경 정보를 백엔드 `/oauth/kakao/callback` API로 전달하는 역할을 합니다.
 *
 * @param code - 카카오 인증 서버에서 받은 인가 코드 (URL 파라미터에서 파싱)
 * @param env - 환경 정보 ('local' 또는 'dev')
 * @returns Promise<LoginApiResponse> - 사용자 정보와 액세스 토큰
 *
 * @example
 * ```typescript
 * // KakaoCallback 컴포넌트에서:
 * const code = new URL(window.location.href).searchParams.get('code');
 * const env = window.location.hostname === 'localhost' ? 'local' : 'dev';
 * const response = await getKakaoLogin(code, env);
 * console.log(response.data.user); // 사용자 정보
 * console.log(response.accessToken); // 액세스 토큰
 * ```
 */

export const getKakaoLogin = async (
  code: string,
  env: string
): Promise<LoginApiResponse> => {
  // AxiosInstance를 사용해서 서버에 요청 (code와 env 쿼리 파라미터 전달)
  const response = await axiosInstance.get<BaseResponse<KakaoLoginResponse>>(
    API_ENDPOINT.AUTH.KAKAO_CALLBACK,
    { params: { code, env } }
  );

  // console.log('[kakaoLogin] 응답 헤더:', response.headers);
  // console.log('[kakaoLogin] 응답 데이터:', response.data);

  // 서버 응답 헤더에서 액세스 토큰 추출
  const accessToken = response.headers['access-token'];
  if (!accessToken) {
    throw new Error(
      RESPONSE_MESSAGE[HTTP_STATUS.UNAUTHORIZED] || '액세스 토큰이 없습니다.'
    );
  }

  return {
    data: response.data.data,
    accessToken,
  };
};
