import { GA_EVENTS } from '@analytics/events';
import { getLandingCtaParams } from '@analytics/params/landing';
import { SCREEN_NAME } from '@analytics/screenNames';
import { trackEvent } from '@analytics/track';
import { loginStatusParams } from '@analytics/utils/loginStatus';

import type { LandingResponse } from '@apis/__generated__/data-contracts';

const landingScreenParams = () => ({
  screen_name: SCREEN_NAME.LANDING,
});

export const trackLandingCtaClick = (landing?: LandingResponse) => {
  trackEvent(GA_EVENTS.landing.BTN_CTA_CLICK, {
    ...landingScreenParams(),
    ...loginStatusParams(),
    ...getLandingCtaParams(landing),
  });
};
