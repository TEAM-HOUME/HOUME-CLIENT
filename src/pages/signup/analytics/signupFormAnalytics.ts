import { GA_EVENTS, type GaEventName } from '@analytics/events';
import { type SignupStep } from '@analytics/params/auth';
import type { TrackEventParams } from '@analytics/params/types';
import { SCREEN_NAME } from '@analytics/screenNames';
import { trackEvent } from '@analytics/track';
import { getLoginEntryRouteParams } from '@analytics/utils/loginEntryRoute/buildLoginSocialEventParams';
import { loginStatusParams } from '@analytics/utils/loginStatus';

const signupFormScreenParams = () => ({
  screen_name: SCREEN_NAME.SIGNUP_FORM,
});

const signupStepParams = (signupStep: SignupStep) => ({
  signup_step: signupStep,
});

const trackSignupFormEvent = (
  eventName: GaEventName,
  extraParams?: TrackEventParams
) => {
  trackEvent(eventName, {
    ...signupFormScreenParams(),
    ...extraParams,
  });
};

export const trackSignupBrowserBackClick = (signupStep: SignupStep) =>
  trackSignupFormEvent(
    GA_EVENTS.signupForm.BROWSER_BACK_CLICK,
    signupStepParams(signupStep)
  );

export const trackSignupBrowserBackSwipe = (signupStep: SignupStep) =>
  trackSignupFormEvent(
    GA_EVENTS.signupForm.BROWSER_BACK_SWIPE,
    signupStepParams(signupStep)
  );

export const trackSignupNicknameFocus = () =>
  trackSignupFormEvent(GA_EVENTS.signupForm.INPUT_NICKNAME_FOCUS);

export const trackSignupNickRandomClick = () =>
  trackSignupFormEvent(GA_EVENTS.signupForm.BTN_NICK_RANDOM_CLICK);

export const trackSignupNickClearClick = () =>
  trackSignupFormEvent(GA_EVENTS.signupForm.BTN_NICK_CLEAR_CLICK);

export const trackSignupBirthFocus = () =>
  trackSignupFormEvent(GA_EVENTS.signupForm.INPUT_BIRTH_FOCUS);

export const trackSignupErrorNickSignView = () =>
  trackSignupFormEvent(GA_EVENTS.signupForm.ERROR_NICK_SIGN_VIEW);

export const trackSignupErrorNickNumView = () =>
  trackSignupFormEvent(GA_EVENTS.signupForm.ERROR_NICK_NUM_VIEW);

export const trackSignupErrorBirthIncorrectView = () =>
  trackSignupFormEvent(GA_EVENTS.signupForm.ERROR_BIRTH_INCORRECT_VIEW);

export const trackSignupErrorBirthUnder14View = () =>
  trackSignupFormEvent(GA_EVENTS.signupForm.ERROR_BIRTH_UNDER14_VIEW);

export const trackSignupGenderClick = () =>
  trackSignupFormEvent(GA_EVENTS.signupForm.BTNGENDER_CLICK);

export const trackSignupCtaClick = () =>
  trackSignupFormEvent(GA_EVENTS.signupForm.BTN_CTA, {
    ...loginStatusParams(),
    return_screen_name: getLoginEntryRouteParams().return_screen_name,
  });

export const trackSignupNotCompModalView = (signupStep: SignupStep) =>
  trackSignupFormEvent(
    GA_EVENTS.signupForm.NOT_COMP_MD_VIEW,
    signupStepParams(signupStep)
  );

export const trackSignupNotCompModalKeepClick = (signupStep: SignupStep) =>
  trackSignupFormEvent(
    GA_EVENTS.signupForm.NOT_COMP_MD_KEEP_CLICK,
    signupStepParams(signupStep)
  );

export const trackSignupNotCompModalQuitClick = (signupStep: SignupStep) =>
  trackSignupFormEvent(
    GA_EVENTS.signupForm.NOT_COMP_MD_QUIT_CLICK,
    signupStepParams(signupStep)
  );
