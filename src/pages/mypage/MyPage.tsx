import { useEffect, useState } from 'react';

import { ErrorBoundary } from 'react-error-boundary';
import { useLocation, useNavigate } from 'react-router-dom';

import { ROUTES } from '@routes/paths';

import { useUserStore } from '@store/useUserStore';

import FeatureErrorFallback from '@components/errorFallback/FeatureErrorFallback';
import InlineError from '@components/inlineError/InlineError';
import Loading from '@components/loading/Loading';
import TitleNavBar from '@components/v2/navBar/TitleNavBar';

import MenuTab from '@/shared/components/v2/menuTab/MenuTab';

import { useMyPageUserQuery } from './apis/queries/useMyPageUserQuery';
import GeneratedImagesSection from './components/section/generatedImages/GeneratedImagesSection';
import ProfileSection from './components/section/profile/ProfileSection';
import SavedItemsSection from './components/section/savedItems/SavedItemsSection';
import * as styles from './MyPage.css';

export type MypageMenuTab = 'generatedImages' | 'savedItems';

const MyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeMenuTab, setActiveMenuTab] = useState<MypageMenuTab>(
    location.state?.activeTab ?? 'generatedImages' // TODO: 결과 페이지에서 수정 필요
  );

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

  useEffect(() => {
    // 로그인되지 않았으면 로그인 페이지로 리디렉션
    if (!isLoggedIn) {
      navigate(ROUTES.LOGIN);
    }
  }, [isLoggedIn, navigate]);

  // 로그인되지 않았으면 아무것도 렌더링하지 않음 (리디렉션 중)
  if (!isLoggedIn) {
    return null;
  }

  const profileName = userData?.name || '사용자';
  const profileCredit = userData?.CreditCount ?? 0;

  return (
    <div className={styles.contentWrapper}>
      <TitleNavBar
        title="마이페이지"
        backLabel="이전"
        isSettingBtn={true}
        onBackClick={() => navigate(-1)}
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
              onTabChange={setActiveMenuTab}
            />
          </div>
          {activeMenuTab === 'generatedImages' && (
            // <GeneratedImagesSection userProfile={userData} />
            <GeneratedImagesSection />
          )}
          {activeMenuTab === 'savedItems' && <SavedItemsSection />}
        </ErrorBoundary>
      )}

      {isUserLoading && <Loading />}
    </div>
  );
};

export default MyPage;
