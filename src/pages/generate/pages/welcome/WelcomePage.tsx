import { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import {
  getSignupCompPageViewParams,
  trackSignupCompCompleteRegistration,
  trackSignupCompCtaClick,
} from '@pages/generate/analytics/signupCompAnalytics';
import { useWelcomePageModelPreload } from '@pages/generate/hooks/useWelcomePageModelPreload';

import { ROUTES } from '@routes/paths';

import { useUserStore } from '@store/useUserStore';

import { GA_EVENTS } from '@shared/analytics/events';
import { useAnalyticsPageView } from '@shared/analytics/hooks';
import { SCREEN_NAME } from '@shared/analytics/screenNames';

import { LOTTIE_SPEED } from '@assets/lottie/lottieAssets';

import ActionButton from '@components/button/actionButton/ActionButton';
import DotLottiePlayer from '@components/lottie/DotLottiePlayer';

import { getLoginRedirect, consumeLoginRedirect } from '@utils/loginRedirect';

import * as styles from './WelcomePage.css';

const TOKEN_COUNT = 5;

const WelcomePage = () => {
  // zustand에서 userName 가져오기
  const userName = useUserStore((state) => state.userName);
  const navigate = useNavigate();

  useWelcomePageModelPreload(); // ONNX 모델 워밍업용 (현재 미사용)

  useAnalyticsPageView(
    GA_EVENTS.signupComp.PAGE_VIEW,
    SCREEN_NAME.SIGNUP_COMP,
    getSignupCompPageViewParams()
  );

  // Meta Pixel CompleteRegistration 이벤트 호출
  useEffect(() => {
    trackSignupCompCompleteRegistration();
  }, []);

  const redirectPath = getLoginRedirect();
  const isFromMypage = redirectPath?.startsWith(ROUTES.MYPAGE);

  const handleCtaClick = () => {
    trackSignupCompCtaClick();

    if (isFromMypage) {
      // 마이페이지 탭 후 로그인 게이트 진입 및 회원가입 완료 → CTA 탭 시 홈으로 이동
      consumeLoginRedirect();
      navigate(ROUTES.HOME);
    } else {
      // 이미지 생성 중 로그인 게이트 진입 및 회원가입 완료 → CTA 탭 시 이미지 생성 플로우 복귀
      // entryRoute는 useImageFlowStore persist(sessionStorage)로 OAuth redirect에서도 유지됨
      navigate(consumeLoginRedirect() ?? ROUTES.IMAGE_SETUP);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.contents}>
        <div className={styles.imgbox}>
          <DotLottiePlayer
            variant="signup"
            speed={LOTTIE_SPEED.SIGNUP}
            className={styles.signupLottie}
            ariaLabel="회원가입 완료 일러스트"
          />
        </div>
        <div className={styles.textbox}>
          <h1 className={styles.title}>
            {userName ? `${userName}님, 지금 바로` : '하우미님, 지금 바로'}
            <br />집 꾸미기 시작해봐요!
          </h1>
          <p className={styles.content}>
            24시간 동안 무료로 이미지를 생성할 수 있는 <br />
            토큰 {TOKEN_COUNT}개를 선물로 드렸어요.
          </p>
        </div>
      </div>
      <div className={styles.btnarea}>
        <ActionButton onClick={handleCtaClick} fullWidth>
          이미지 생성 시작하기
        </ActionButton>
      </div>
    </div>
  );
};

export default WelcomePage;
