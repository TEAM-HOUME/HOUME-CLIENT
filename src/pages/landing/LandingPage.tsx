import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import type { HomeLocationState } from '@pages/home/HomePage';
import { trackLandingCtaClick } from '@pages/landing/analytics/landingAnalytics';
import { LANDING_CTA_BY_VARIANT } from '@pages/landing/constants/landingCtaAbTest';

import { ROUTES } from '@routes/paths';

import { GA_EVENTS } from '@shared/analytics/events';
import { useAnalyticsPageView } from '@shared/analytics/hooks';
import { getLandingTestType } from '@shared/analytics/params/landing';
import { SCREEN_NAME } from '@shared/analytics/screenNames';
import { loginStatusParams } from '@shared/analytics/utils/loginStatus';

import { useLandingQuery } from '@apis/queries/useLandingQuery';

import ActionButton from '@components/button/actionButton/ActionButton';
import OptimizedImage from '@components/image/OptimizedImage';
import LogoNavBar from '@components/navBar/LogoNavBar';

import { useABTest } from '@hooks/useABTest';

import { IMAGE_SIZES } from '@utils/imageVariant';

import * as styles from './LandingPage.css';

const LANDING_BANNER_AFTER_DELAY_MS = 2000;

const LandingPage = () => {
  const navigate = useNavigate();
  const { variant, isLoading: isABTestLoading } = useABTest();
  const { data: landingData } = useLandingQuery();
  const landingItems = landingData?.landings ?? [];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const itemCount = landingItems.length;
    if (itemCount <= 1) {
      setCurrentIndex(0);
      return;
    }

    setCurrentIndex((prev) => (prev >= itemCount ? 0 : prev));

    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % itemCount);
    }, LANDING_BANNER_AFTER_DELAY_MS);

    return () => window.clearInterval(intervalId);
  }, [landingItems.length]);
  const selectedLanding = landingItems[currentIndex] ?? landingItems[0];

  useAnalyticsPageView(
    GA_EVENTS.landing.PAGE_VIEW,
    SCREEN_NAME.LANDING,
    {
      ...loginStatusParams(),
      test_type: getLandingTestType(variant),
    },
    // A/B 배정이 확정된 뒤 발사 — 최초 방문자가 default variant로 오집계되는 것 방지
    { enabled: !isABTestLoading }
  );

  const handleNavigateHome = () => {
    trackLandingCtaClick(selectedLanding);

    const bannerId = selectedLanding?.bannerId;
    const state: HomeLocationState = {
      activeTab: 'explore',
      ...(typeof bannerId === 'number' && bannerId > 0
        ? { exploreSeedBannerId: bannerId }
        : {}),
    };
    navigate(ROUTES.HOME, { state });
  };

  const ctaStyle = LANDING_CTA_BY_VARIANT[variant];

  return (
    <main className={styles.page}>
      {landingItems.map((item, index) =>
        item.imageUrl ? (
          <OptimizedImage
            key={item.bannerId ?? index}
            src={item.imageUrl}
            sizes={IMAGE_SIZES.full}
            alt="랜딩 배경 이미지"
            aria-hidden
            loading={index === 0 ? 'eager' : 'lazy'}
            className={`${styles.backgroundImage}${
              index === currentIndex ? ` ${styles.backgroundImageVisible}` : ''
            }`}
          />
        ) : null
      )}
      <LogoNavBar screenName={SCREEN_NAME.LANDING} page="landing" />
      <section className={styles.mainSection}>
        <div className={styles.contentBlock}>
          <div className={styles.textContainer}>
            <p className={styles.title}>
              {selectedLanding?.name}
              <br />
              나를 위한 맞춤형 인테리어는?
            </p>
            <p className={styles.text}>
              집 구조, 취향, 생활 방식까지 반영하는 AI 홈 스타일링
            </p>
          </div>
          <ActionButton
            variant={ctaStyle.buttonVariant}
            color={ctaStyle.color}
            size="L"
            leftIcon={ctaStyle.leftIcon}
            onClick={handleNavigateHome}
          >
            우리 집 바꾸러 가기
          </ActionButton>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
