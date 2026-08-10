import { globalStyle } from '@vanilla-extract/css';

import {
  TOAST_SHOW_EASING,
  TOAST_SHOW_MS,
  toastHideInteraction,
  toastShowContentOpacityInteraction,
  toastShowInteraction,
} from '@styles/tokens/interaction/presets';

globalStyle('[data-sonner-toast]', {
  transition: toastShowInteraction,
});

globalStyle('[data-sonner-toast] > *', {
  transition: toastShowContentOpacityInteraction,
});

/** Sonner removed 상태별 하드코딩 transition 오버라이드 */
globalStyle(
  '[data-sonner-toast][data-removed="true"][data-front="false"][data-swipe-out="false"][data-expanded="false"]',
  {
    transition: toastHideInteraction,
  }
);

/** drag down swipe-out */
globalStyle(
  '[data-sonner-toast][data-swipe-out="true"][data-y-position="bottom"], [data-sonner-toast][data-swipe-out="true"][data-y-position="top"]',
  {
    animationDuration: `${TOAST_SHOW_MS}ms`,
    animationTimingFunction: TOAST_SHOW_EASING,
  }
);
