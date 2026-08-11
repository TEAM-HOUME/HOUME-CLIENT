import { useMemo } from 'react';

import { generatePath, useNavigate } from 'react-router-dom';

import {
  trackHomeBannerSlideEvent,
  trackHomeWebBannerClick,
} from '@pages/home/analytics/homeAnalytics';
import Banner, {
  type BannerSlide,
} from '@pages/home/components/explore/banner/Banner';
import { useLandingQuery } from '@pages/landing/apis/queries/useLandingQuery';

import { ROUTES } from '@routes/paths';

import { GA_EVENTS } from '@shared/analytics/events';

import promoBanner from '@assets/icons/PromoBanner.svg?url';

import * as styles from './ExploreTab.css';
import RoomTypeSection from './RoomTypeSection/RoomTypeSection';
import StyleSection from './StyleSection/StyleSection';

type ExploreTabProps = {
  exploreSeedBannerId?: number;
  onPromoBannerClick?: () => void;
  hasPreviousImage?: boolean;
  hasPreviousSpace?: boolean;
};

const ExploreTab = ({
  exploreSeedBannerId,
  onPromoBannerClick,
  hasPreviousImage = false,
  hasPreviousSpace = false,
}: ExploreTabProps) => {
  const navigate = useNavigate();
  const { data: landingData } = useLandingQuery();

  const seedBannerId = useMemo(() => {
    if (exploreSeedBannerId != null && exploreSeedBannerId > 0) {
      return exploreSeedBannerId;
    }
    const first = landingData?.landings?.[0]?.bannerId;
    if (first != null && first > 0) {
      return first;
    }
    return 0;
  }, [exploreSeedBannerId, landingData?.landings]);

  const handlePromoBannerClick = () => {
    trackHomeWebBannerClick();
    onPromoBannerClick?.();
  };

  const handleBannerSlideClick = (slide: BannerSlide) => {
    trackHomeBannerSlideEvent(GA_EVENTS.home.BANNER_BG_IMG_CLICK, slide);

    navigate(
      // React Router generatePath 기반 동적 라우팅 적용
      generatePath(ROUTES.BANNER_DETAIL, { bannerId: String(slide.id) })
    );
  };

  return (
    <div className={styles.container}>
      <Banner
        seedBannerId={seedBannerId}
        onSlideClick={handleBannerSlideClick}
        onBannerSwipe={(direction, slide) => {
          trackHomeBannerSlideEvent(
            direction === 'left'
              ? GA_EVENTS.home.BANNER_LEFT_SWIPE
              : GA_EVENTS.home.BANNER_RIGHT_SWIPE,
            slide
          );
        }}
      />
      <div className={styles.content}>
        <RoomTypeSection
          hasPreviousImage={hasPreviousImage}
          hasPreviousSpace={hasPreviousSpace}
        />
        <button
          type="button"
          className={styles.promoBannerButton}
          aria-label="상품 탭으로 이동"
          onClick={handlePromoBannerClick}
        >
          <img src={promoBanner} alt="" className={styles.promoBannerImage} />
        </button>
        <StyleSection />
      </div>
    </div>
  );
};

export default ExploreTab;
