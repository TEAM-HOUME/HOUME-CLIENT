import { useCallback, useState } from 'react';

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

import { HOME_TAB_PARAM } from '@constants/compareParams';

import { applyCompareTabParams, parseHomeTab } from '@utils/compareTabPath';
import { setLoginRedirect } from '@utils/loginRedirect';

import CompareTab from './components/compare/CompareTab';
import ExploreTab from './components/explore/ExploreTab';
import ProductTab from './components/product/ProductTab';
import * as styles from './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const accessToken = useUserStore((state) => state.accessToken);
  const isLoggedIn = !!accessToken;
  const location = useLocation();
  const homeState = location.state as HomeLocationState | undefined;
  const [searchParams, setSearchParams] = useSearchParams();

  // URL에 tab이 없을 때 쓸 탭. 마운트 때 한 번만 정한다 — 이후 탭 전환은 항상 URL에 tab을 쓰므로 다시 볼 일이 없다.
  // 1) navigate state의 activeTab (랜딩 CTA → 탐색, 결과 화면 '상품 다시 선택하기'·마이페이지 빈 화면 → 상품)
  // 2) 외부 진입(로그인 복귀/ResultPage 재선택) 흐름 감지: flow가 PRODUCT_SELECTION이고 productsToBeRestored가 비어있지 않으면
  //    사용자가 '이 상품들로 우리 집 꾸미기' CTA를 거쳐서 돌아오는 중 → 상품 탭
  //    (productsToBeRestored는 ProductTab mount 직후 소비(null)되므로 다음 진입엔 영향 없음)
  // 3) 그 외 탐색 탭
  const [fallbackTab] = useState<HomeTab>(() => {
    if (homeState?.activeTab) return homeState.activeTab;
    const flow = useImageFlowStore.getState().flow;
    const hasProductsToBeRestored =
      flow?.route === 'PRODUCT_SELECTION' &&
      (flow.productsToBeRestored?.length ?? 0) > 0;
    return hasProductsToBeRestored ? 'product' : 'explore';
  });

  // 탭은 URL이 정한다. 다른 화면에서 /?tab=compare&jobId=… 로 navigate해도 그 탭이 그려지게 하기 위해서다
  // (마운트 때만 읽으면 탐색 탭에 있을 때 주소만 바뀌고 화면은 그대로 남는다)
  const activeMenuTab =
    parseHomeTab(searchParams.get(HOME_TAB_PARAM)) ?? fallbackTab;
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

  // 탭 전환은 URL ?tab= 에 쓴다 → 로그인 게이트로 이탈했다 복귀해도 같은 탭으로 돌아옴.
  // 탐색 탭도 tab=explore를 명시적으로 쓴다. 지우면 위 fallbackTab(상품)이 다시 적용돼 탐색 탭으로 못 가는 경우가 생긴다
  const handleTabChange = (tab: HomeTab) => {
    if (tab === 'explore' && activeMenuTab !== 'explore') {
      trackHomeTapExploreClick();
    }

    if (tab === 'product' && activeMenuTab !== 'product') {
      trackHomeTapShopClick();
    }

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(HOME_TAB_PARAM, tab);
        return next;
      },
      { replace: true }
    );
  };

  const navigateToCompareTab = useCallback(
    (options?: { presetId?: number }) => {
      const presetId = options?.presetId;
      setSearchParams(
        (prev) =>
          applyCompareTabParams(prev, presetId != null ? { presetId } : null),
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
            setSearchParams(
              (prev) => {
                const next = new URLSearchParams(prev);
                next.set(HOME_TAB_PARAM, 'product');
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
