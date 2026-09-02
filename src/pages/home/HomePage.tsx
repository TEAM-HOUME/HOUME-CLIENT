import { useCallback, useMemo, useState } from 'react';

import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import {
  trackHomeTapExploreClick,
  trackHomeTapShopClick,
} from '@pages/home/analytics/homeAnalytics';

import { ROUTES } from '@routes/paths';

import { useImageFlowStore } from '@store/useImageFlowStore';
import { useUserStore } from '@store/useUserStore';

import type { HomeLocationState, HomeTab } from '@shared/types/tabNavigation';

import { GA_EVENTS } from '@analytics/events';
import { useAnalyticsPageView } from '@analytics/hooks/useAnalyticsPageView';
import { useScrollDepthTrack } from '@analytics/hooks/useScrollDepthTrack';
import { LOGIN_ENTRY_ROUTE } from '@analytics/params/gate';
import { SCREEN_NAME } from '@analytics/screenNames';
import { persistLoginEntryRoute } from '@analytics/utils/loginEntryRoute/storeLoginEntryRoute';
import { loginStatusParams } from '@analytics/utils/loginStatus';

import { useMyPageUserQuery } from '@apis/queries/useMyPageUserQuery';
import { useRecentFloorPlanQuery } from '@apis/queries/useRecentFloorPlanQuery';

import MenuTab from '@components/menuTab/MenuTab';
import LogoNavBar from '@components/navBar/LogoNavBar';
import StatusBadge from '@components/statusBadge/StatusBadge';

import { setLoginRedirect } from '@utils/loginRedirect';

import CompareTab from './components/compare/CompareTab';
import ExploreTab from './components/explore/ExploreTab';
import ProductTab from './components/product/ProductTab';
import {
  COMPARE_JOB_ID_PARAM,
  COMPARE_PRESET_ID_PARAM,
  COMPARE_PRODUCT_URL_PARAM,
} from './constants/compareParams';
import * as styles from './HomePage.css';

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

  const [activeMenuTab, setActiveMenuTab] = useState<HomeTab>(
    tabParam === 'product' || tabParam === 'explore' || tabParam === 'compare'
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
  const handleTabChange = (tab: HomeTab) => {
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
        else if (tab === 'compare') next.set('tab', 'compare');
        else next.delete('tab');
        return next;
      },
      { replace: true }
    );
  };

  const navigateToCompareTab = useCallback(
    (options?: { presetId?: number }) => {
      setActiveMenuTab('compare');
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('tab', 'compare');
          next.delete(COMPARE_JOB_ID_PARAM);
          next.delete(COMPARE_PRODUCT_URL_PARAM);

          const presetId = options?.presetId;
          if (presetId != null) {
            next.set(COMPARE_PRESET_ID_PARAM, String(presetId));
          } else {
            next.delete(COMPARE_PRESET_ID_PARAM);
          }

          return next;
        },
        { replace: false }
      );
    },
    [setSearchParams]
  );

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
          {
            value: 'compare',
            label: '비교',
            badge: <StatusBadge label="BETA" />,
          },
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
          onNavigateToCompareTab={navigateToCompareTab}
        />
      )}
      {activeMenuTab === 'product' && <ProductTab />}
      {activeMenuTab === 'compare' && <CompareTab />}
    </main>
  );
};

export default HomePage;
