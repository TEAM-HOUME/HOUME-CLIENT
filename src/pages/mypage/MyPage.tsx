import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileSection from './components/profile/ProfileSection';
import HistorySection from './components/history/HistorySection';
import SettingSection from './components/setting/SettingSection';
import * as styles from './MyPage.css';
import { useMyPageUser } from './hooks/useMypage';
import TitleNavBar from '@/shared/components/navBar/TitleNavBar';
import Loading from '@/shared/components/loading/Loading';
import { useErrorHandler } from '@/shared/hooks/useErrorHandler';
import { useUserStore } from '@/store/useUserStore';
import { ROUTES } from '@/routes/paths';

const MyPage = () => {
  const { handleError } = useErrorHandler('mypage');
  const navigate = useNavigate();

  // 로그인 상태 확인
  const accessToken = useUserStore((state) => state.accessToken);
  const isLoggedIn = !!accessToken;

  // 로그인되지 않았으면 로그인 페이지로 리디렉션
  useEffect(() => {
    if (!isLoggedIn) {
      navigate(ROUTES.LOGIN);
    }
  }, [isLoggedIn, navigate]);

  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
    error,
  } = useMyPageUser({
    enabled: isLoggedIn, // 로그인 상태일 때만 API 호출
  });

  useEffect(() => {
    if (isLoggedIn && isUserError && error) {
      handleError(error, 'api');
    }
  }, [isLoggedIn, isUserError, userData, isUserLoading, error, handleError]);

  // 로그인되지 않았으면 아무것도 렌더링하지 않음 (리디렉션 중)
  if (!isLoggedIn) {
    return null;
  }

  // 로딩 상태 처리
  if (isUserLoading) {
    return (
      <>
        <div className={styles.contentWrapper}>
          <TitleNavBar
            title="마이페이지"
            isBackIcon
            isLoginBtn={false}
            onBackClick={() => navigate(ROUTES.HOME)}
          />
        </div>
        <Loading />
      </>
    );
  }

  // 에러 상태 처리
  if (isUserError || !userData) {
    return null;
  }

  return (
    <div className={styles.contentWrapper}>
      <TitleNavBar
        title="마이페이지"
        isBackIcon
        isLoginBtn={false}
        onBackClick={() => navigate(ROUTES.HOME)}
      />
      <ProfileSection
        userName={userData.name || '사용자'}
        credit={userData.CreditCount ?? 0}
        isChargeDisabled={false}
      />
      <HistorySection />
      <SettingSection />
    </div>
  );
};

export default MyPage;
