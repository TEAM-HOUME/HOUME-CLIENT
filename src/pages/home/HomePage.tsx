import { useEffect, useRef, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { useMyPageUserQuery } from '@pages/mypage/apis/queries/useMyPageUserQuery';

import { ROUTES } from '@routes/paths';

import { useImageFlowStore, ENTRY_ROUTE } from '@store/useImageFlowStore';
import { useUserStore } from '@store/useUserStore';

import MenuTab from '@components/v2/menuTab/MenuTab';
import LogoNavBar from '@components/v2/navBar/LogoNavBar';

import ExploreTab from './components/explore/ExploreTab';
import ProductTab from './components/product/ProductTab';
import * as styles from './HomePage.css';
import {
  logLandingClickBtnCTA,
  logLandingClickBtnMypage,
  logLandingScrollDepthTreshold,
} from './utils/analytics';

export type HomeMenuTab = 'explore' | 'product';

const HomePage = () => {
  const navigate = useNavigate();
  const accessToken = useUserStore((state) => state.accessToken);
  const isLoggedIn = !!accessToken;
  const location = useLocation();
  const [activeMenuTab, setActiveMenuTab] = useState<HomeMenuTab>(
    location.state?.activeTab ?? 'explore'
  );

  const scrollDepth50Sent = useRef(false);
  const scrollDepth100Sent = useRef(false);

  // TODO: v1에서 로그인 확인용으로 사용, v2 구현 과정에서 임시 미사용 처리함
  useMyPageUserQuery({ enabled: isLoggedIn });

  // 스크롤 깊이 추적
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrollPercentage =
        scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

      // 50% 도달 시 이벤트 전송 (초기 1회)
      if (scrollPercentage >= 50 && !scrollDepth50Sent.current) {
        logLandingScrollDepthTreshold(50);
        scrollDepth50Sent.current = true;
      }

      // 100% 도달 시 이벤트 전송 (초기 1회)
      if (
        (scrollPercentage >= 99.5 ||
          scrollTop + window.innerHeight >=
            document.documentElement.scrollHeight - 10) &&
        !scrollDepth100Sent.current
      ) {
        logLandingScrollDepthTreshold(100);
        scrollDepth100Sent.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleGenerate = () => {
    logLandingClickBtnCTA();
    useImageFlowStore
      .getState()
      .setFlow({ entryRoute: ENTRY_ROUTE.GENERATE_BUTTON });
    navigate(ROUTES.IMAGE_SETUP);
  };

  // 프로필 버튼 클릭 핸들러 (마이페이지 버튼 클릭 이벤트 전송)
  const handleProfile = () => {
    if (isLoggedIn) {
      logLandingClickBtnMypage();
    }
    navigate(ROUTES.MYPAGE);
  };

  const handleLogin = () => {
    navigate(ROUTES.LOGIN);
  };

  return (
    <main className={styles.page}>
      <LogoNavBar
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
        onTabChange={setActiveMenuTab}
      />
      {activeMenuTab === 'explore' && <ExploreTab />}
      {activeMenuTab === 'product' && <ProductTab />}
    </main>
  );
};

export default HomePage;
