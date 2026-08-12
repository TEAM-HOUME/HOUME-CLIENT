import { useEffect, useState } from 'react';

import { ErrorBoundary } from 'react-error-boundary';
import { useLocation, useNavigate } from 'react-router-dom';

import { ROUTES } from '@routes/paths';

import { useUserStore } from '@store/useUserStore';

import { LOGIN_ENTRY_ROUTE } from '@analytics/params/gate';
import { persistLoginEntryRoute } from '@analytics/utils/loginEntryRoute/storeLoginEntryRoute';

import { useMyPageUserQuery } from '@apis/queries/useMyPageUserQuery';

import FeatureErrorFallback from '@components/errorFallback/FeatureErrorFallback';
import InlineError from '@components/inlineError/InlineError';
import Loading from '@components/loading/Loading';
import MenuTab from '@components/menuTab/MenuTab';
import TitleNavBar from '@components/navBar/TitleNavBar';

import { setLoginRedirect } from '@utils/loginRedirect';

import { useMypageAnalytics } from './analytics/useMypageAnalytics';
import { useMyPageProfileQuery } from './apis/queries/useEditProfileQuery';
import GeneratedImagesSection from './components/section/generatedImages/GeneratedImagesSection';
import ProfileSection from './components/section/profile/ProfileSection';
import SavedItemsSection from './components/section/savedItems/SavedItemsSection';
import * as styles from './MyPage.css';

export type MypageMenuTab = 'generatedImages' | 'savedItems';

const DEFAULT_MENU_TAB: MypageMenuTab = 'generatedImages';

const getMypageMenuTab = (tab: unknown) => {
  if (tab === 'generatedImages' || tab === 'savedItems') {
    return tab;
  }

  return undefined;
};

const MyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeMenuTab, setActiveMenuTab] = useState<MypageMenuTab>(
    () => getMypageMenuTab(location.state?.activeTab) ?? DEFAULT_MENU_TAB
  );

  useEffect(() => {
    const nextTab = getMypageMenuTab(location.state?.activeTab);

    if (!nextTab) {
      return;
    }

    setActiveMenuTab(nextTab);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.key, location.pathname, location.state?.activeTab, navigate]);

  // 탭 상태 관리 (찜 토스트로 들어온 경우 찜 탭으로 이동을 위해 추가했었음.)
  // // sessionStorage에서 탭 정보 가져오기
  // const initialTab =
  //   (sessionStorage.getItem('activeTab') as 'savedItems' | 'generatedImages') ||
  //   'generatedImages';
  // const [activeTab, setActiveTab] = useState<'savedItems' | 'generatedImages'>(
  //   initialTab
  // );

  // useEffect(() => {
  //   // 탭 정보 사용 후 제거
  //   sessionStorage.removeItem('activeTab');
  // }, []);

  // 로그인 상태 확인
  const accessToken = useUserStore((state) => state.accessToken);
  const isLoggedIn = !!accessToken;

  const {
    data: userData,
    isPending: isUserLoading,
    isError: isUserError,
    refetch,
  } = useMyPageUserQuery({
    enabled: isLoggedIn,
  });
  const { data: profileData } = useMyPageProfileQuery({
    enabled: isLoggedIn,
  });

  const { handleTabChange, handleBackClick, handleSettingClick } =
    useMypageAnalytics({
      activeMenuTab,
      setActiveMenuTab,
    });

  useEffect(() => {
    // 로그인되지 않았으면 로그인 페이지로 리디렉션
    if (!isLoggedIn) {
      setLoginRedirect(ROUTES.MYPAGE);
      persistLoginEntryRoute(LOGIN_ENTRY_ROUTE.TOP_NAV_LOGIN);
      navigate(ROUTES.LOGIN);
    }
  }, [isLoggedIn, navigate]);

  // 로그인되지 않았으면 아무것도 렌더링하지 않음 (리디렉션 중)
  if (!isLoggedIn) {
    return null;
  }

  const profileName = profileData?.nickname || userData?.name || '사용자';
  const profileCredit = userData?.CreditCount ?? 0;

  return (
    <div className={styles.contentWrapper}>
      <TitleNavBar
        title="마이페이지"
        backLabel="이전"
        isSettingBtn={true}
        onBackClick={handleBackClick}
        onSettingClick={handleSettingClick}
      />

      {isUserError ? (
        <InlineError onRetry={refetch} />
      ) : (
        <ErrorBoundary FallbackComponent={FeatureErrorFallback}>
          <ProfileSection
            userName={profileName}
            credit={profileCredit}
            maxCredit={5}
          />

          <div className={styles.menuTabContainer}>
            <MenuTab
              menuType="mypage"
              tabs={[
                { value: 'generatedImages', label: '생성한 이미지' },
                { value: 'savedItems', label: '찜한 상품' },
              ]}
              activeTab={activeMenuTab}
              onTabChange={handleTabChange}
            />
          </div>
          {activeMenuTab === 'generatedImages' && <GeneratedImagesSection />}
          {activeMenuTab === 'savedItems' && <SavedItemsSection />}
        </ErrorBoundary>
      )}

      {isUserLoading && <Loading />}
    </div>
  );
};

export default MyPage;
