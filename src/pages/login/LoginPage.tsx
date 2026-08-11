import { Link } from 'react-router-dom';

import { ROUTES } from '@routes/paths';

import { GA_EVENTS } from '@shared/analytics/events';
import { useAnalyticsPageView } from '@shared/analytics/hooks';
import { SCREEN_NAME } from '@shared/analytics/screenNames';
import { trackCallback } from '@shared/analytics/track';
import { getLoginSocialParams } from '@shared/analytics/utils/loginEntryRoute';

import { LOTTIE_SPEED } from '@assets/lottie/lottieAssets';

import Icon from '@components/icon/Icon';
import DotLottiePlayer from '@components/lottie/DotLottiePlayer';

import { API_ENDPOINT } from '@constants/apiEndpoints';

import * as styles from './loginPage.css';
import { getAuthEnvironment } from './utils/environment';

const LoginPage = () => {
  useAnalyticsPageView(
    GA_EVENTS.loginSocial.PAGE_VIEW,
    SCREEN_NAME.LOGIN_SOCIAL,
    getLoginSocialParams()
  );

  /**
   * 카카오 로그인 버튼 클릭 핸들러
   *
   * 로그인 흐름:
   * 1. 프론트엔드가 현재 환경을 감지하여 `local` | `preview` | `dev` 쿼리 파라미터 결정
   * 2. 백엔드 `/oauth/kakao?env=local|preview|dev`로 리다이렉트
   * 3. 백엔드가 `env` 쿼리 파라미터를 기반으로 프론트엔드 URL 결정
   *    - `env=local`: http://localhost:5173
   *    - `env=preview`: http://preview.houme.kr
   *    - `env=dev`: https://www.houme.kr
   * 4. 백엔드가 카카오 인증 서버로 리다이렉트 (동적 redirect_uri 포함)
   * 5. 카카오 인증 완료 후 프론트엔드 `/oauth/kakao/callback?code=인가코드`로 리다이렉트
   * 6. KakaoCallback 컴포넌트에서 인가 코드(code)를 파싱
   * 7. 파싱한 code를 백엔드 `/oauth/kakao/callback` API로 전달하여 로그인 처리
   */
  const handleKakaoLogin = trackCallback(
    GA_EVENTS.loginSocial.BTN_CTA_CLICK,
    SCREEN_NAME.LOGIN_SOCIAL,
    () => {
      // 현재 환경 감지: hostname 기반으로 local/preview/dev 결정
      const hostname = window.location.hostname;
      const env = getAuthEnvironment(hostname);

      // 백엔드 `/oauth/kakao` 엔드포인트로 리다이렉트 (env, prompt 쿼리 파라미터 포함)
      // 백엔드가 env 파라미터를 기반으로 프론트엔드 URL을 결정하고
      // prompt=login 파라미터를 카카오 인증 URL에 포함시켜 항상 로그인 화면이 표시되도록 합니다.
      // 카카오 인증을 처리한 후 프론트엔드 `/oauth/kakao/callback?code=인가코드`로 리다이렉트합니다.
      const backendAuthUrl = `${import.meta.env.VITE_API_BASE_URL}${API_ENDPOINT.AUTH.KAKAO_AUTH}?env=${env}&prompt=login`;

      window.location.href = backendAuthUrl;
    },
    getLoginSocialParams()
  );

  return (
    <div className={styles.container}>
      <div className={styles.imgbox}>
        <DotLottiePlayer
          variant="login"
          speed={LOTTIE_SPEED.LOGIN}
          className={styles.loginImg}
          ariaLabel="로그인 일러스트"
        />
      </div>
      <div className={styles.textbox}>
        <h1 className={styles.title}>
          이제 머릿속으로 상상하지 말고, <br />
          AI로 미리 그려보세요.
        </h1>
        <p className={styles.content}>
          로그인하고 우리 집을 원하는 대로 만들어봐요.
        </p>
      </div>

      <div className={styles.btnarea}>
        <div className={styles.buttonWrapper}>
          <button
            type="button"
            onClick={handleKakaoLogin}
            className={styles.btn}
          >
            <Icon name="Kakao" />
            <span className={styles.kakaoText}>카카오 로그인</span>
          </button>
        </div>

        <aside className={styles.aside}>
          가입 시{' '}
          <Link
            to={ROUTES.SETTING_SERVICE}
            className={styles.link}
            onClick={trackCallback(
              GA_EVENTS.loginSocial.BTN_SERVICE_TERM_CLICK,
              SCREEN_NAME.LOGIN_SOCIAL
            )}
          >
            서비스 약관
          </Link>{' '}
          및{' '}
          <Link
            to={ROUTES.SETTING_PRIVACY}
            className={styles.link}
            onClick={trackCallback(
              GA_EVENTS.loginSocial.BTN_PRIVACY_POLICY_CLICK,
              SCREEN_NAME.LOGIN_SOCIAL
            )}
          >
            개인정보처리방침
          </Link>
          에 동의한 것으로 간주합니다.
        </aside>
      </div>
    </div>
  );
};

export default LoginPage;
