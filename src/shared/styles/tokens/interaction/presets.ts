import {
  interaction,
  interactionDurationMs,
  interactionEasing,
  type InteractionSpec,
} from '@styles/tokens/interaction/utils';

const interactionTransitions = (
  spec: InteractionSpec,
  properties: readonly string[]
) =>
  properties.map((property) => interaction({ ...spec, property })).join(', ');

// --- Press (공통) ---

const pressTransformSpec = {
  trigger: 'whilePressing',
  action: 'stateChange',
  duration: 'fastest',
  easing: 'bezier.out',
  property: 'transform',
} as const satisfies InteractionSpec;

export const pressTransformInteraction = interaction(pressTransformSpec);

/** whilePressing transition + :active scale */
export const pressInteraction = (
  scale: number,
  activeSelector = '&:active'
) => ({
  transition: pressTransformInteraction,
  selectors: {
    [activeSelector]: {
      transform: `scale(${scale})`,
    },
  },
});

// --- Popup ---

const popupFadeInSpec = {
  trigger: 'tap',
  action: 'motion.fadeIn',
  duration: 'fast',
  easing: 'bezier.back',
  property: 'opacity',
} as const satisfies InteractionSpec;

export const popupFadeInInteraction = interactionTransitions(popupFadeInSpec, [
  'opacity',
  'transform',
]);

export const popupFadeInOpacityInteraction = interaction({
  ...popupFadeInSpec,
  property: 'opacity',
});

// --- Bottom Sheet ---

const sheetSlideInSpec = {
  trigger: 'tap',
  action: 'motion.slideIn',
  duration: 'base',
  easing: 'bezier.out',
  property: 'transform',
} as const satisfies InteractionSpec;

const sheetSlideOutSpec = {
  trigger: 'tap',
  action: 'motion.slideOut',
  duration: 'base',
  easing: 'bezier.out',
  property: 'transform',
} as const satisfies InteractionSpec;

export const sheetSlideInteraction = interactionTransitions(sheetSlideInSpec, [
  'transform',
  'height',
]);

export const sheetSlideOutOpacityInteraction = interaction({
  ...sheetSlideOutSpec,
  property: 'opacity',
});

export const SHEET_SLIDE_MS = interactionDurationMs(sheetSlideInSpec);

// --- Toast ---

const toastShowSpec = {
  trigger: 'tap',
  action: 'motion.fadeIn',
  duration: 'slower',
  easing: 'bezier.out',
  property: 'opacity',
} as const satisfies InteractionSpec;

const toastHideSpec = {
  trigger: 'afterDelay',
  action: 'motion.fadeOut',
  duration: 'slower',
  easing: 'bezier.out',
  property: 'opacity',
} as const satisfies InteractionSpec;

export const toastShowInteraction = interactionTransitions(toastShowSpec, [
  'opacity',
  'transform',
  'height',
]);

export const toastHideInteraction = interactionTransitions(toastHideSpec, [
  'opacity',
  'transform',
  'height',
]);

export const toastShowContentOpacityInteraction = interaction({
  ...toastShowSpec,
  property: 'opacity',
});

export const TOAST_SHOW_MS = interactionDurationMs(toastShowSpec);
export const TOAST_SHOW_EASING = interactionEasing(toastShowSpec);

// --- Tooltip ---

export const tooltipFadeInSpec = {
  trigger: 'afterDelay',
  action: 'motion.fadeIn',
  duration: 'base',
  easing: 'bezier.back',
  property: 'opacity',
} as const satisfies InteractionSpec;

export const TOOLTIP_AFTER_DELAY_MS = 1000;

// --- Landing ---

const landingBgTransitionSpec = {
  trigger: 'afterDelay',
  action: 'stateChange',
  duration: 'slower',
  easing: 'bezier.inout',
  property: 'opacity',
} as const satisfies InteractionSpec;

export const landingBgInteraction = interaction(landingBgTransitionSpec);

// --- ImgFeedback tag group ---

const tagGroupOpenSpec = {
  trigger: 'tap',
  action: 'stateChange',
  duration: 'fast',
  easing: 'bezier.out',
  property: 'opacity',
} as const satisfies InteractionSpec;

export const tagGroupOpenInteraction = interactionTransitions(
  tagGroupOpenSpec,
  ['opacity', 'padding-top']
);
