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

  /**
   * 크레딧 기반 플로팅 버튼 텍스트 결정
   * - 로그인 안됨: "우리집에 딱 맞는 스타일 만들기"
   * - 로그인됨 + 로딩중: "로딩중..."
   * - 로그인됨 + 크레딧 있음: "우리집에 딱 맞는 스타일 만들기"
   * - 로그인됨 + 크레딧 없음: "무료 이미지 생성은 1번만 가능해요"
   */
  const getButtonText = () => {
    if (!isLoggedIn) return '우리집에 딱 맞는 스타일 만들기';
    if (isUserDataLoading) return '로딩중...';
    if (userData?.CreditCount && userData.CreditCount > 0) {
      return '우리집에 딱 맞는 스타일 만들기';
    }
    return '무료 이미지 생성은 1번만 가능해요';
  };

  /**
   * 플로팅 버튼 클릭 핸들러
   * - 로그인 안됨: 로그인 페이지로 이동
   * - 로그인됨 + 크레딧 있음: onboarding 이미지 생성 플로우로 이동
   * - 로그인됨 + 크레딧 없음: 버튼 비활성화로 인해 클릭 불가
   */
  const handleCtaButtonClick = () => {
    if (!isLoggedIn) {
      navigate(ROUTES.LOGIN);
      return;
    }

    if (isUserDataLoading) return;

    // 크레딧이 있으면 onboarding으로 이동
    if (userData?.CreditCount && userData.CreditCount > 0) {
      navigate(ROUTES.ONBOARDING);
    }
    // 크레딧이 없으면 아무 동작 안 함 (버튼이 비활성화됨)
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
        {/* 로그인 상태와 크레딧에 따라 하단 플로팅 버튼 동적 변경 */}
        <CtaButton
          onClick={handleCtaButtonClick}
          isActive={
            !isLoggedIn || isUserDataLoading || (userData?.CreditCount ?? 0) > 0
          }
        >
          {getButtonText()}
        </CtaButton>
      </div>
    </main>
  );
};

export default HomePage;
