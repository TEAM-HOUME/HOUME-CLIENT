import LogoNavBar from '@shared/components/navBar/LogoNavBar';
import { useNavigate } from 'react-router-dom';
import IntroSection from './components/introSection/IntroSection';
import StepGuideSection from './components/stepGuideSection/StepGuideSection';
import ReviewSection from './components/reviewSection/ReviewSection';
import { AnimatedSection } from './components/AnimatedSection';
import * as styles from './HomePage.css';
import CtaButton from '@/shared/components/button/ctaButton/CtaButton';
import { useUserStore } from '@/store/useUserStore';
import { useMyPageUser } from '@/pages/mypage/hooks/useMypage';
import { ROUTES } from '@/routes/paths';

const HomePage = () => {
  const navigate = useNavigate();
  const accessToken = useUserStore((state) => state.accessToken);
  const isLoggedIn = !!accessToken;

  const { data: userData, isLoading: isUserDataLoading } = useMyPageUser({
    enabled: isLoggedIn,
  });

  const getButtonText = () => {
    if (!isLoggedIn) return '로그인하고 스타일 보기';
    if (isUserDataLoading) return '로딩중...';
    if (userData?.CreditCount && userData.CreditCount > 0) {
      return '우리집에 딱 맞는 스타일 보기';
    }
    return '마이페이지에서 크레딧 충전하기';
  };

  const handleCtaButtonClick = () => {
    if (!isLoggedIn) {
      navigate(ROUTES.LOGIN);
      return;
    }

    if (isUserDataLoading) return;

    if (userData?.CreditCount && userData.CreditCount > 0) {
      navigate(ROUTES.ONBOARDING);
    } else {
      navigate(ROUTES.MYPAGE);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.gradFrame}>
        <LogoNavBar buttonType={isLoggedIn ? 'profile' : 'login'} />
        <div className={styles.introSection}>
          <IntroSection />
        </div>
      </div>
      <div className={styles.contents}>
        <StepGuideSection />
        <AnimatedSection animationType="fadeInUp" delay={200} duration={1000}>
          <ReviewSection />
        </AnimatedSection>
      </div>
      <div className={styles.buttonContainer}>
        <CtaButton onClick={handleCtaButtonClick}>{getButtonText()}</CtaButton>
      </div>
    </main>
  );
};

export default HomePage;
