import { useMemo, useState } from 'react';

import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import {
  trackHomeTapExploreClick,
  trackHomeTapShopClick,
} from '@pages/home/analytics/homeAnalytics';
import { useRecentFloorPlanQuery } from '@pages/imageSetup/v2/apis/queries/useRecentFloorPlanQuery';
import { useMyPageUserQuery } from '@pages/mypage/apis/queries/useMyPageUserQuery';

import { ROUTES } from '@routes/paths';

import { useImageFlowStore } from '@store/useImageFlowStore';
import { useUserStore } from '@store/useUserStore';

import { GA_EVENTS } from '@shared/analytics/events';
import {
  useAnalyticsPageView,
  useScrollDepthTrack,
} from '@shared/analytics/hooks';
import { LOGIN_ENTRY_ROUTE } from '@shared/analytics/params/gate';
import { SCREEN_NAME } from '@shared/analytics/screenNames';
import { persistLoginEntryRoute } from '@shared/analytics/utils/loginEntryRoute';
import { loginStatusParams } from '@shared/analytics/utils/loginStatus';

import MenuTab from '@components/v2/menuTab/MenuTab';
import LogoNavBar from '@components/v2/navBar/LogoNavBar';

import { setLoginRedirect } from '@utils/loginRedirect';

import ExploreTab from './components/explore/ExploreTab';
import ProductTab from './components/product/ProductTab';
import * as styles from './HomePage.css';

export type HomeMenuTab = 'explore' | 'product';

export type HomeLocationState = {
  activeTab?: HomeMenuTab;
  exploreSeedBannerId?: number;
};

const HomePage = () => {
  const navigate = useNavigate();
  const accessToken = useUserStore((state) => state.accessToken);
  const isLoggedIn = !!accessToken;
  const location = useLocation();
  const homeState = location.state as HomeLocationState | undefined;
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  // 외부 진입(로그인 복귀/ResultPage 재선택) 흐름 감지:
  // flow가 PRODUCT_SELECTION이고 productsToBeRestored이 비어있지 않으면
  // -> 사용자가 '이 상품들로 우리 집 꾸미기' CTA를 거쳐서 돌아오는 중. 따라서 '상품' 탭으로 이동
  // HomePage mount 시 1회만 평가 (productsToBeRestored는 ProductTab mount 직후 소비(null)되므로 다음 진입엔 영향 없음)
  const presetHasProductsToBeRestored = useMemo(() => {
    const flow = useImageFlowStore.getState().flow;
    return (
      flow?.route === 'PRODUCT_SELECTION' &&
      (flow.productsToBeRestored?.length ?? 0) > 0
    );
  }, []);

  const [activeMenuTab, setActiveMenuTab] = useState<HomeMenuTab>(
    tabParam === 'product' || tabParam === 'explore'
      ? tabParam
      : (homeState?.activeTab ??
          (presetHasProductsToBeRestored ? 'product' : 'explore'))
  );
  const isExploreTab = activeMenuTab === 'explore';
  const { data: recentFloorPlanData, isFetched: isRecentFloorPlanFetched } =
    useRecentFloorPlanQuery();
  const hasPreviousImage = recentFloorPlanData?.hasRecentImage === true;

  useAnalyticsPageView(
    GA_EVENTS.home.PAGE_VIEW,
    SCREEN_NAME.HOME,
    { ...loginStatusParams(), has_previous_image: hasPreviousImage },
    { enabled: isExploreTab && isRecentFloorPlanFetched }
  );

  useScrollDepthTrack(GA_EVENTS.home.PAGE_SCROLL, SCREEN_NAME.HOME, {
    enabled: isExploreTab,
    extraParams: loginStatusParams(),
  });

  // 탭 전환 시 URL ?tab= 에 반영 → 로그인 게이트로 이탈했다 복귀해도 같은 탭으로 돌아옴
  const handleTabChange = (tab: HomeMenuTab) => {
    if (tab === 'explore' && activeMenuTab !== 'explore') {
      trackHomeTapExploreClick();
    }

    if (tab === 'product' && activeMenuTab !== 'product') {
      trackHomeTapShopClick();
    }

    setActiveMenuTab(tab);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (tab === 'product') next.set('tab', 'product');
        else next.delete('tab');
        return next;
      },
      { replace: true }
    );
  };

  // TODO: v1에서 로그인 확인용으로 사용, v2 구현 과정에서 임시 미사용 처리함
  useMyPageUserQuery({ enabled: isLoggedIn });

  const handleGenerate = () => {
    useImageFlowStore.getState().startFlow({ route: 'GENERATE_BUTTON' });
    navigate(ROUTES.IMAGE_SETUP);
  };

  const handleProfile = () => {
    navigate(ROUTES.MYPAGE);
  };

  const handleLogin = () => {
    setLoginRedirect(location.pathname + location.search);
    persistLoginEntryRoute(LOGIN_ENTRY_ROUTE.TOP_NAV_LOGIN);
    navigate(ROUTES.LOGIN);
  };

  return (
    <main className={styles.page}>
      <LogoNavBar
        screenName={SCREEN_NAME.HOME}
        page="home"
        showGenerateButton
        authSlot={isLoggedIn ? 'profile' : 'login'}
        onGenerateClick={handleGenerate}
        onProfileClick={handleProfile}
        onLoginClick={handleLogin}
      />
      <MenuTab
        tabs={[
          { value: 'explore', label: '탐색' },
          { value: 'product', label: '상품' },
        ]}
        activeTab={activeMenuTab}
        sticky={activeMenuTab === 'explore'}
        onTabChange={handleTabChange}
      />
      {activeMenuTab === 'explore' && (
        <ExploreTab
          exploreSeedBannerId={homeState?.exploreSeedBannerId}
          onPromoBannerClick={() => {
            setActiveMenuTab('product');
            setSearchParams(
              (prev) => {
                const next = new URLSearchParams(prev);
                next.set('tab', 'product');
                return next;
              },
              { replace: true }
            );
          }}
          hasPreviousImage={hasPreviousImage}
          hasPreviousSpace={hasPreviousImage}
        />
      )}
      {activeMenuTab === 'product' && <ProductTab />}
    </main>
  );
};

export default HomePage;
