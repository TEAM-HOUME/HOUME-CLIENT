/**
 * 카카오 OAuth 콜백 처리 컴포넌트
 *
 * 카카오 인증 서버에서 리다이렉트되어 오는 콜백 페이지입니다.
 * URL 파라미터에서 인가 코드(code)를 파싱하여 백엔드 콜백 API로 전달합니다.
 *
 * 전체 로그인 흐름:
 * 1. 사용자가 카카오 로그인 버튼 클릭
 * 2. 프론트엔드가 백엔드 `/oauth/kakao?env=local|preview|dev`로 리다이렉트
 * 3. 백엔드가 `env`를 기반으로 redirect_uri 계산
 *    - local: http://localhost:5173/oauth/kakao/callback
 *    - preview: http://preview.houme.kr/oauth/kakao/callback
 *    - dev: https://www.houme.kr/oauth/kakao/callback
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

import Loading from '@components/loading/Loading';

import { RESPONSE_MESSAGE, HTTP_STATUS } from '@constants/response';

import { useErrorHandler } from '@hooks/useErrorHandler';

import { useKakaoLoginMutation } from './apis/mutations/useKakaoLoginMutation';
import { getAuthEnvironment } from './utils/environment';

const KakaoCallbackPage = () => {
  // 오류 핸들러 (인가 코드 없음 케이스 전용)
  const { handleError } = useErrorHandler('login');

  // Tanstack Query - useKakaoLoginMutation 훅 호출
  const { mutate: kakaoLogin, isPending } = useKakaoLoginMutation();

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');

    const hostname = window.location.hostname;
    const env = getAuthEnvironment(hostname);

    if (code) {
      // 로그인 성공/실패 핸들링 로직은 mutation 선언부에서 처리
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

  if (isPending) {
    return <Loading />;
  }

  return <Loading />;
};

export default KakaoCallbackPage;
