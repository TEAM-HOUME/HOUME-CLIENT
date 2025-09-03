import { API_ENDPOINT } from '@constants/apiEndpoints';
import axiosInstance from '@shared/apis/axiosInstance';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { BaseResponse } from '@shared/types/apis';
import type { KakaoLoginResponse, LoginApiResponse } from '../types/auth';
import { RESPONSE_MESSAGE, HTTP_STATUS } from '@/shared/constants/response';
import { ROUTES } from '@/routes/paths';
import { useUserStore } from '@/store/useUserStore';

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
    throw new Error(
      RESPONSE_MESSAGE[HTTP_STATUS.UNAUTHORIZED] || '액세스 토큰이 없습니다.'
    );
  }

  return {
    data: response.data.data,
    accessToken,
  };
};

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
 * // 카카오 인가 코드로 로그인
 * login('authorization_code');
 * ```
 */

export const useKakaoLoginMutation = () => {
  const navigate = useNavigate();
  const setAccessToken = useUserStore((state) => state.setAccessToken);

  return useMutation<LoginApiResponse, Error, string>({
    mutationFn: getKakaoLogin,
    onSuccess: (response) => {
      const accessToken = response.accessToken;
      setAccessToken(accessToken); // zustand에 저장 (localStorage 동시 저장)

      // 가입 여부에 따라 리다이렉트 (response.data가 true면 신규회원, false면 기존회원)
      if (response.data) {
        navigate(ROUTES.SIGNUP);
      } else {
        navigate(ROUTES.HOME);
      }
    },
    onError: (error) => {
      // 오류 처리는 KakaoCallback 컴포넌트에서 useErrorHandler로 처리
      console.error('[useKakaoLoginMutation] 로그인 실패:', error);
    },
  });
};
