/**
 * 카카오 OAuth 로그인 API 함수
 *
 * 카카오 인증 서버에서 받은 인가 코드를 사용하여 서버에 로그인 요청을 보냅니다.
 * 서버는 인가 코드를 검증하고 사용자 정보와 액세스 토큰을 반환합니다.
 *
 * @param code - 카카오 OAuth 인증 후 받은 인가 코드
 * @returns Promise<LoginApiResponse> - 사용자 정보와 액세스 토큰
 *
 * @example
 * ```typescript
 * const response = await kakaoLogin('authorization_code_from_kakao');
 * console.log(response.data.user); // 사용자 정보
 * console.log(response.accessToken); // 액세스 토큰
 * ```
 */
import { API_ENDPOINT } from '@constants/apiEndpoints';
import axiosInstance from '@shared/apis/axiosInstance';

import type { KakaoLoginResponse, LoginApiResponse } from '../types/auth';
import type { BaseResponse } from '@shared/types/apis';

export const getKakaoLogin = async (
  code: string
): Promise<LoginApiResponse> => {
  // console.log('[kakaoLogin] 인가 코드:', code);

  // AxiosInstance를 사용해서 서버에 요청
  const response = await axiosInstance.get<BaseResponse<KakaoLoginResponse>>(
    API_ENDPOINT.AUTH.KAKAO_CALLBACK,
    { params: { code } }
  );

  // console.log('[kakaoLogin] 응답 헤더:', response.headers);
  // console.log('[kakaoLogin] 응답 데이터:', response.data);

  // 서버 응답 헤더에서 액세스 토큰 추출
  const accessToken = response.headers['access-token'];
  if (!accessToken) {
    console.error('[kakaoLogin] 액세스 토큰이 헤더에 없습니다.');
    console.error(
      '[kakaoLogin] 사용 가능한 헤더:',
      Object.keys(response.headers)
    );
    throw new Error('액세스 토큰이 없습니다.');
  }

  return {
    data: response.data.data,
    accessToken,
  };
};
