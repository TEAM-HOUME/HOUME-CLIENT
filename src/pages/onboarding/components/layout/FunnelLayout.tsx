import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useFunnelStore } from '@pages/onboarding/stores/useFunnelStore'; // 경로는 실제 경로로 수정
import TitleNavBar from '@/shared/components/navBar/TitleNavBar';
import Popup from '@/shared/components/overlay/popup/Popup';

interface FunnelLayoutProps {
  children: React.ReactNode;
}

const FunnelLayout = ({ children }: FunnelLayoutProps) => {
  const [showExitPopup, setShowExitPopup] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isOnboardingPage = location.pathname === '/onboarding';
  const fromPage = searchParams.get('from'); // 'home' 또는 'signup-complete'

  // Zustand store에서 resetFunnel 함수 가져오기
  const resetFunnel = useFunnelStore((state) => state.resetFunnel);

  useEffect(() => {
    if (!isOnboardingPage) return;

    // 브라우저 뒤로가기 이벤트 처리
    const handlePopState = (event: PopStateEvent) => {
      // 뒤로가기를 막기 위해 현재 위치를 다시 푸시
      window.history.pushState(null, '', window.location.pathname);
      setShowExitPopup(true);
    };

    // 현재 페이지를 히스토리에 푸시 (뒤로가기 감지를 위해)
    window.history.pushState(null, '', window.location.pathname);

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOnboardingPage]);

  const handleBackClick = () => {
    if (isOnboardingPage) {
      setShowExitPopup(true);
    } else {
      navigate(-1);
    }
  };

  const handlePopupClose = () => {
    setShowExitPopup(false);
  };

  const handleExit = () => {
    // 퍼널 데이터 초기화
    resetFunnel();

    // 실제로 나가기 (이벤트 리스너 제거 후 적절한 페이지로 리다이렉트)
    window.removeEventListener('popstate', () => {});

    // from 파라미터에 따라 다른 페이지로 리다이렉트
    if (fromPage === 'home') {
      navigate('/');
    } else if (fromPage === 'signup-complete') {
      navigate('/signup/complete'); // 또는 ROUTES.SIGNUP_COMPLETE가 있다면 그것을 사용
    } else {
      // 기본값: 이전 페이지로 이동
      navigate(-1);
    }
  };

  return (
    <div>
      <TitleNavBar
        title="스타일링 이미지 생성"
        isBackIcon={true}
        isLoginBtn={false}
        onBackClick={handleBackClick}
      />
      <div>{children}</div>

      {showExitPopup && (
        <Popup
          onClose={handlePopupClose}
          onConfirm={handleExit}
          title={`지금 나가면 무료로\n이미지를 생성할 수 없어요`}
          detail={`이 페이지를 떠나면 지금까지 입력한\n정보와 함께 무료 토큰도 사라져요.`}
        />
      )}
    </div>
  );
};

export default FunnelLayout;
