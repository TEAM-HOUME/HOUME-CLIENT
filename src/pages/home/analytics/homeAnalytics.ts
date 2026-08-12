import type { BannerSlide } from '@pages/home/components/explore/banner/Banner';

import { GA_EVENTS } from '@analytics/events';
import {
  getHomeBannerParams,
  getHomeStyleParams,
} from '@analytics/params/builders/homeContent';
import { SCREEN_NAME } from '@analytics/screenNames';
import { trackEvent } from '@analytics/track';
import { loginStatusParams } from '@analytics/utils/loginStatus';

import type { ExploreHouseTemplateDetailResponse } from '@apis/__generated__/data-contracts';

interface HomeSpaceCardInput {
  spaceId?: number;
  spaceName?: string;
  spaceSize?: string;
  spaceView?: string;
  hasPreviousSpace?: boolean;
  hasPreviousImage?: boolean;
}

/** house-template 상세 API → home_spaceCard_click space_* 파라미터 */
export const getHomeSpaceCardParamsFromDetail = (
  detail?: ExploreHouseTemplateDetailResponse | null
) => ({
  spaceSize: detail?.equilibrium,
  spaceView: detail?.floorPlans?.[0]?.view,
});

const homeScreenParams = () => ({
  screen_name: SCREEN_NAME.HOME,
});

const homeScreenWithLoginParams = () => ({
  ...homeScreenParams(),
  ...loginStatusParams(),
});

export const trackHomeTapExploreClick = () => {
  trackEvent(GA_EVENTS.home.TAP_EXPLORE_CLICK, homeScreenWithLoginParams());
};

export const trackHomeTapShopClick = () => {
  trackEvent(GA_EVENTS.home.TAP_SHOP_CLICK, homeScreenWithLoginParams());
};

export const trackHomeWebBannerClick = () => {
  trackEvent(GA_EVENTS.home.WEB_BANNER_CLICK, homeScreenWithLoginParams());
};

export const trackHomeSpaceMoreClick = () => {
  trackEvent(GA_EVENTS.home.SPACE_MORE_CLICK, homeScreenWithLoginParams());
};

export const trackHomeSpaceMoreCardClick = () => {
  trackEvent(GA_EVENTS.home.SPACE_MORE_CARD_CLICK, homeScreenWithLoginParams());
};

export const trackHomeStyleMoreClick = () => {
  trackEvent(GA_EVENTS.home.STYLE_MORE_CLICK, homeScreenWithLoginParams());
};

export const trackHomeBannerSlideEvent = (
  eventName:
    | typeof GA_EVENTS.home.BANNER_BG_IMG_CLICK
    | typeof GA_EVENTS.home.BANNER_LEFT_SWIPE
    | typeof GA_EVENTS.home.BANNER_RIGHT_SWIPE,
  slide: BannerSlide | undefined
) => {
  if (!slide) return;

  if (
    eventName === GA_EVENTS.home.BANNER_LEFT_SWIPE ||
    eventName === GA_EVENTS.home.BANNER_RIGHT_SWIPE
  ) {
    trackEvent(eventName, {
      ...homeScreenParams(),
      ...getHomeBannerParams({ bannerId: slide.id, bannerName: slide.title }),
    });
    return;
  }

  trackEvent(eventName, {
    ...homeScreenWithLoginParams(),
    ...getHomeBannerParams({ bannerId: slide.id, bannerName: slide.title }),
    selected_banner_chip: '',
  });
};

export const trackHomeSpaceCardClick = ({
  spaceId,
  spaceName,
  spaceSize,
  spaceView,
  hasPreviousSpace,
  hasPreviousImage,
}: HomeSpaceCardInput) => {
  trackEvent(GA_EVENTS.home.SPACE_CARD_CLICK, {
    ...homeScreenWithLoginParams(),
    has_previous_space: hasPreviousSpace,
    has_previous_image: hasPreviousImage,
    space_id: spaceId,
    space_name: spaceName,
    space_size: spaceSize,
    space_view: spaceView,
  });
};

export const trackHomeSpaceCardSlideScroll = () => {
  trackEvent(GA_EVENTS.home.SPACE_CARD_SLIDE_SCROLL, homeScreenParams());
};

export const trackHomeStyleCardClick = (style: {
  id: number;
  name?: string;
}) => {
  trackEvent(GA_EVENTS.home.STYLE_CARD_CLICK, {
    ...homeScreenWithLoginParams(),
    ...getHomeStyleParams({ styleId: style.id, styleName: style.name }),
  });
};
