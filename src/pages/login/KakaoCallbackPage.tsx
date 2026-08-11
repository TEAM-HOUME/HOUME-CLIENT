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

import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@routes/paths';

import { reportMessage } from '@shared/monitoring/report';
import { MONITORING_SCOPE } from '@shared/monitoring/scope';

import Loading from '@components/loading/Loading';

import { SIGNUP_EXIT_MODAL_PENDING_KEY } from '@hooks/useBrowserBackTrap';

import { useKakaoLoginMutation } from './apis/mutations/useKakaoLoginMutation';
import { getAuthEnvironment } from './utils/environment';

/** 백엔드로 전달해 이미 소비한 인가 코드 — 뒤로가기 재진입(재사용 403) 판별용 */
export const KAKAO_USED_AUTH_CODE_KEY = 'kakaoUsedAuthCode';

const KakaoCallbackPage = () => {
  const navigate = useNavigate();

  // Tanstack Query - useKakaoLoginMutation 훅 호출
  const { mutate: kakaoLogin } = useKakaoLoginMutation();

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const isReusedCode =
      code !== null &&
      code === sessionStorage.getItem(KAKAO_USED_AUTH_CODE_KEY);

    // 회원가입 진행 중 뒤로가기로 callback URL에 도달한 경우(새 인가 코드 아님)
    // — 인가 코드 재사용(403) 방지 및 이탈 확인 모달 복구
    const signupToken = sessionStorage.getItem('signupToken');
    if (signupToken && (!code || isReusedCode)) {
      sessionStorage.setItem(SIGNUP_EXIT_MODAL_PENDING_KEY, '1');
      navigate(ROUTES.SIGNUP, {
        replace: true,
        state: { signupToken },
      });
      return;
    }

    // 회원가입 완료/로그인 완료 후 뒤로가기로 재진입한 경우 — 재호출하면 403이므로 홈으로
    if (isReusedCode) {
      navigate(ROUTES.HOME, { replace: true });
      return;
    }

    const hostname = window.location.hostname;
    const env = getAuthEnvironment(hostname);

    if (code) {
      // 새 OAuth 콜백: 이전 회원가입 세션 잔여물 정리 (신규 회원이면 mutation이 새로 세팅)
      sessionStorage.removeItem('signupToken');
      sessionStorage.removeItem(SIGNUP_EXIT_MODAL_PENDING_KEY);
      sessionStorage.setItem(KAKAO_USED_AUTH_CODE_KEY, code);
      // 로그인 성공/실패 핸들링 로직은 mutation 선언부에서 처리
      kakaoLogin({ code, env });
    } else {
      // 인가 코드 없이 콜백에 도달한 비정상 진입 — API 호출 전 플로우 분기라
      // 중앙 에러 경로(axios·queryClient)가 잡을 수 없어 이 지점에서 계측·처리
      reportMessage('kakao callback missing auth code', {
        scope: MONITORING_SCOPE.AUTH,
        level: 'warning',
        fingerprint: ['kakao-callback', 'missing-code'],
      });
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [kakaoLogin, navigate]);

  return <Loading />;
};

export default KakaoCallbackPage;
