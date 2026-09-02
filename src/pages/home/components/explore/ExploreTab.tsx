import { useMemo } from 'react';

import { generatePath, useNavigate } from 'react-router-dom';

import {
  trackHomeBannerSlideEvent,
  trackHomeWebBannerClick,
} from '@pages/home/analytics/homeAnalytics';
import { useComparePresetsQuery } from '@pages/home/apis/queries/useComparePresetsQuery';
import Banner, {
  type BannerSlide,
} from '@pages/home/components/explore/banner/Banner';

import { ROUTES } from '@routes/paths';

import { GA_EVENTS } from '@analytics/events';

import { useLandingListQuery } from '@apis/queries/useLandingListQuery';

import promoBanner from '@assets/images/PromoBanner.svg';

import WidgetCard from '@components/widgetCard/WidgetCard';

import * as styles from './ExploreTab.css';
import RoomTypeSection from './roomTypeSection/RoomTypeSection';
import StyleSection from './styleSection/StyleSection';

type ExploreTabProps = {
  exploreSeedBannerId?: number;
  onPromoBannerClick?: () => void;
  hasPreviousImage?: boolean;
  hasPreviousSpace?: boolean;
  /** 비교 탭으로 이동한다. presetId가 있으면 프리셋 고정 결과 조회를 시작한다 */
  onNavigateToCompareTab: (options?: { presetId?: number }) => void;
};

const ExploreTab = ({
  exploreSeedBannerId,
  onPromoBannerClick,
  hasPreviousImage = false,
  hasPreviousSpace = false,
  onNavigateToCompareTab,
}: ExploreTabProps) => {
  const navigate = useNavigate();
  const { data: landingData } = useLandingListQuery();
  const { data: presetsData } = useComparePresetsQuery();

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

  const widgetProducts = useMemo(
    () =>
      (presetsData?.presets ?? []).map((preset) => ({
        presetId: preset.presetId,
        name: preset.title,
        imageSrc: preset.thumbnailUrl ?? undefined,
        onClick: () => onNavigateToCompareTab({ presetId: preset.presetId }),
      })),
    [onNavigateToCompareTab, presetsData?.presets]
  );

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
        <WidgetCard
          products={widgetProducts}
          onSearchClick={() => onNavigateToCompareTab()}
        />
        <StyleSection />
      </div>
    </div>
  );
};

export default ExploreTab;
