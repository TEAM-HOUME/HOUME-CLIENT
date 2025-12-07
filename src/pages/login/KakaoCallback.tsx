/**
 * 카카오 OAuth 콜백 처리 컴포넌트
 *
 * 카카오 인증 서버에서 리다이렉트되어 오는 콜백 페이지입니다.
 * URL 파라미터에서 인가 코드(code)를 파싱하여 백엔드 콜백 API로 전달합니다.
 *
 * 전체 로그인 흐름:
 * 1. 사용자가 카카오 로그인 버튼 클릭
 * 2. 프론트엔드가 백엔드 `/oauth/kakao`로 리다이렉트 (Origin 헤더 포함)
 * 3. 백엔드가 Origin 헤더를 파싱하여 redirect_uri 계산
 *    - 예: Origin이 http://localhost:5173이면 redirect_uri = http://localhost:5173/oauth/kakao/callback
 * 4. 백엔드가 카카오 인증 서버로 리다이렉트 (redirect_uri 포함)
 * 5. 카카오 인증 완료 후 프론트엔드 `/oauth/kakao/callback?code=인가코드`로 리다이렉트
 * 6. 이 컴포넌트가 렌더링되고 인가 코드(code)를 파싱
 * 7. 파싱한 인가 코드를 백엔드 `/oauth/kakao/callback` API로 전달
 * 8. 로그인 성공 → 홈페이지 또는 회원가입 페이지로 이동
 *
 * @example
 * URL: http://localhost:5173/oauth/kakao/callback?code=authorization_code
 */
import { useEffect } from 'react';

import Loading from '@/shared/components/loading/Loading';
import { RESPONSE_MESSAGE, HTTP_STATUS } from '@/shared/constants/response';
import { useErrorHandler } from '@/shared/hooks/useErrorHandler';

import { useKakaoLoginMutation } from './hooks/useKakaoLogin';

const KakaoCallback = () => {
  // 오류 핸들러
  const { handleError } = useErrorHandler('login');

  // Tanstack Query - useKakaoLoginMutation 훅 호출
  const {
    mutate: kakaoLogin,
    isPending,
    isError,
    error,
  } = useKakaoLoginMutation();

  useEffect(() => {
    // 카카오 인증 완료 후 프론트엔드로 리다이렉트된 URL에서 인가 코드(code) 파싱
    // 예: http://localhost:5173/oauth/kakao/callback?code=인가코드
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');

    // 환경 감지: hostname이 localhost면 local, 아니면 dev
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost';
    const env = isLocalhost ? 'local' : 'dev';

    if (code) {
      // 파싱한 인가 코드와 환경 정보를 백엔드 콜백 API(/oauth/kakao/callback)로 전달
      kakaoLogin({ code, env });
    } else {
      handleError(
        new Error(
          RESPONSE_MESSAGE[HTTP_STATUS.BAD_REQUEST] || '인가 코드가 없습니다'
        ),
        'auth',
        '로그인 처리 중 오류가 발생했습니다.'
      );
    }
  }, [kakaoLogin, handleError]);

  // 오류 발생 시 useErrorHandler로 처리
  useEffect(() => {
    if (isError && error) {
      handleError(error, 'api', '로그인 처리 중 오류가 발생했습니다.');
    }
  }, [isError, error, handleError]);

  if (isPending) {
    return <Loading />;
  }

  return <Loading />;
};

export default KakaoCallback;
