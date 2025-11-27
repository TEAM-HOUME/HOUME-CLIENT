import { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { useABTest } from '@/pages/generate/hooks/useABTest';
import { logGenerateStartClickBtnCTA } from '@/pages/generate/utils/analytics';
import { ROUTES } from '@/routes/paths';
import CtaButton from '@/shared/components/button/ctaButton/CtaButton';
import TitleNavBar from '@/shared/components/navBar/TitleNavBar';
import { useUserStore } from '@/store/useUserStore';

import SignupImage from '@assets/icons/loginAfter.png';
import { OBJ365_MODEL_PATH } from '@pages/generate/constants/detection';
import { preloadONNXModel } from '@pages/generate/hooks/useOnnxModel';

import * as styles from './StartPage.css.ts';

const StartPage = () => {
  // zustand에서 userName 가져오기
  const userName = useUserStore((state) => state.userName);
  const navigate = useNavigate();
  const { variant } = useABTest();

  useEffect(() => {
    // 이미지 생성 플로우 진입 시 모델 선로딩
    preloadONNXModel(OBJ365_MODEL_PATH).catch((err) => {
      console.warn('[StartPage] preload model failed', err);
    });
  }, []);

  const handleGoToImageSetup = () => {
    // 이미지 생성 시작 페이지 CTA 버튼 클릭 시 GA 이벤트 전송
    logGenerateStartClickBtnCTA(variant);
    navigate(ROUTES.IMAGE_SETUP);
  };

  return (
    <div className={styles.container}>
      <TitleNavBar title="시작하기" isBackIcon={false} isLoginBtn={false} />
      <div className={styles.textbox}>
        <h1 className={styles.title}>
          {userName ? `${userName}님, 지금 바로` : '하우미님, 지금 바로'}
          <br />집 꾸미기 시작해봐요!
        </h1>
        <p className={styles.content}>
          AI 이미지처럼 내 집을 꾸밀 수 있도록 <br />
          구매 가능한 상품까지 바로 추천 해드려요.
        </p>
      </div>
      <div className={styles.imgbox}>
        <img
          src={SignupImage}
          alt="회원가입 완료 이미지"
          className={styles.signUpImg}
          loading="lazy"
        />
      </div>
      <div className={styles.btnarea}>
        <CtaButton onClick={handleGoToImageSetup}>이미지 만들러가기</CtaButton>
      </div>
    </div>
  );
};

export default StartPage;
