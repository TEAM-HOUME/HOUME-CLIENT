import { useNavigate } from 'react-router-dom';

import { useABTest } from '@pages/generate/hooks/useABTest';
import { useWelcomePageModelPreload } from '@pages/generate/hooks/useWelcomePageModelPreload';
import { logGenerateStartClickBtnCTA } from '@pages/generate/utils/analytics';

import { ROUTES } from '@routes/paths';

import { ENTRY_ROUTE, useImageFlowStore } from '@store/useImageFlowStore';
import { useUserStore } from '@store/useUserStore';

import SignupImage from '@assets/images/signupWelcome.png';

import CtaButton from '@components/button/ctaButton/CtaButton';

import { getLoginRedirect, consumeLoginRedirect } from '@utils/loginRedirect';

import * as styles from './WelcomePage.css';

const WelcomePage = () => {
  // zustand에서 userName 가져오기
  const userName = useUserStore((state) => state.userName);
  const navigate = useNavigate();
  const { variant } = useABTest();

  useWelcomePageModelPreload(); // ONNX 모델 워밍업용 (현재 미사용)
  const setFlow = useImageFlowStore((state) => state.setFlow);

  const redirectPath = getLoginRedirect();
  const isFromMypage = redirectPath?.startsWith(ROUTES.MYPAGE);

  const handleCtaClick = () => {
    logGenerateStartClickBtnCTA(variant);

    if (isFromMypage) {
      // 마이페이지 탭 후 로그인 게이트 진입 및 회원가입 완료 → CTA 탭 시 홈으로 이동
      consumeLoginRedirect();
      navigate(ROUTES.HOME);
    } else {
      // 이미지 생성 중 로그인 게이트 진입 및 회원가입 완료 → CTA 탭 시 이미지 생성 플로우 복귀
      setFlow({ entryRoute: ENTRY_ROUTE.GENERATE_BUTTON });
      navigate(consumeLoginRedirect() ?? ROUTES.IMAGE_SETUP);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.contents}>
        <div className={styles.imgbox}>
          <img
            src={SignupImage}
            alt="회원가입 완료 이미지"
            className={styles.signUpImg}
          />
        </div>
        <div className={styles.textbox}>
          <h1 className={styles.title}>
            {userName ? `${userName}님, 지금 바로` : '하우미님, 지금 바로'}
            <br />집 꾸미기 시작해봐요!
          </h1>
          <p className={styles.content}>
            24시간 동안 무료로 이미지를 생성할 수 있는 <br />
            토큰 N개를 선물로 드렸어요.
          </p>
        </div>
      </div>
      <div className={styles.btnarea}>
        <CtaButton onClick={handleCtaClick}>
          {isFromMypage ? '홈에서 시작하기' : '계속해서 이미지 생성하기'}
        </CtaButton>
      </div>
    </div>
  );
};

export default WelcomePage;
