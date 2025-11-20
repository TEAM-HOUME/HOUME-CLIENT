import { useNavigate } from 'react-router-dom';

import { useMyPageUser } from '@/pages/mypage/hooks/useMypage';
import { ROUTES } from '@/routes/paths';
import CtaButton from '@/shared/components/button/ctaButton/CtaButton';
import { useUserStore } from '@/store/useUserStore';

import LogoNavBar from '@shared/components/navBar/LogoNavBar';

import { AnimatedSection } from './components/AnimatedSection';
import IntroSection from './components/introSection/IntroSection';
import ReviewSection from './components/reviewSection/ReviewSection';
import StepGuideSection from './components/stepGuideSection/StepGuideSection';
import * as styles from './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const accessToken = useUserStore((state) => state.accessToken);
  const isLoggedIn = !!accessToken;

  const { data: userData, isLoading: isUserDataLoading } = useMyPageUser({
    enabled: isLoggedIn,
  });

  /**
   * 플로팅 버튼 텍스트 결정
   * - 로그인 안됨: "우리집에 딱 맞는 스타일 만들기"
   * - 로그인됨 + 로딩중: "로딩중..."
   * - 로그인됨: "우리집에 딱 맞는 스타일 만들기"
   */
  const getButtonText = () => {
    if (!isLoggedIn) return '우리집에 딱 맞는 스타일 만들기';
    if (isUserDataLoading) return '로딩중...';
    return '우리집에 딱 맞는 스타일 만들기';
  };

  /**
   * 플로팅 버튼 클릭 핸들러
   * - 로그인 안됨: 로그인 페이지로 이동
   * - 로그인됨: imageSetup 이미지 생성 플로우로 이동 (크레딧 체크는 ActivityInfo에서 수행)
   */
  const handleCtaButtonClick = () => {
    if (!isLoggedIn) {
      navigate(ROUTES.LOGIN);
      return;
    }

    if (isUserDataLoading) return;

    // 크레딧 체크 없이 무조건 퍼널 진입 허용
    navigate(ROUTES.IMAGE_SETUP);
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
        {/* 로그인 상태에 따라 하단 플로팅 버튼 동적 변경 */}
        <CtaButton onClick={handleCtaButtonClick} isActive={!isUserDataLoading}>
          {getButtonText()}
        </CtaButton>
      </div>
    </main>
  );
};

export default HomePage;
