import { useNavigate } from 'react-router-dom';
import SignupImage from '@assets/icons/loginAfter.png';
import * as styles from './SignupCompletePage.css';
import CtaButton from '@/shared/components/button/ctaButton/CtaButton';
import TitleNavBar from '@/shared/components/navBar/TitleNavBar';
import { ROUTES } from '@/routes/paths';
import { useUserStore } from '@/store/useUserStore';

const SignupCompletePage = () => {
  // zustand에서 userName 가져오기
  const userName = useUserStore((state) => state.userName);
  const navigate = useNavigate();

  const handleGoToOnboarding = () => {
    navigate(ROUTES.ONBOARDING);
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
          24시간 동안 무료로 이미지를 생성할 수 있는 <br />
          토큰 1개를 선물로 드렸어요.
        </p>
      </div>
      <div className={styles.imgbox}>
        <img
          src={SignupImage}
          alt="회원가입 완료 이미지"
          className={styles.signUpImg}
        />
      </div>
      <div className={styles.btnarea}>
        <CtaButton onClick={handleGoToOnboarding}>이미지 만들러가기</CtaButton>
      </div>
    </div>
  );
};

export default SignupCompletePage;
