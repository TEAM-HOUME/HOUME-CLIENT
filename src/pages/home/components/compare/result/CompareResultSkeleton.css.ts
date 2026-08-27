import { keyframes, style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import {
  interactionDurationValues,
  interactionVars,
} from '@styles/tokens/interaction/tokens.css';
import { unitVars } from '@styles/tokens/unit.css';

const skeletonAnimationDurationMs = 2000; // 애니메이션 전체 주기

const toKeyframePercent = (elapsedMs: number) =>
  `${(elapsedMs / skeletonAnimationDurationMs) * 100}%`;

const opacityFadeInEndMs = interactionDurationValues.fast;
const opacityHoldEndMs = opacityFadeInEndMs + interactionDurationValues.base;
const opacityFadeOutEndMs = opacityHoldEndMs + interactionDurationValues.base;
const opacityFadeBackInEndMs =
  opacityFadeOutEndMs + interactionDurationValues.base;

// scale 애니메이션 (0.9 → 1)
const scaleAnimation = keyframes({
  '0%': {
    transform: 'scale(0.9)',
    animationTimingFunction: interactionVars.interaction.easing['bezier.inout'],
  },
  [toKeyframePercent(interactionDurationValues.slowest)]: {
    transform: 'scale(1)',
  },
  '100%': {
    transform: 'scale(1)',
  },
});

// opacity 애니메이션 (0 → 1 → 1 → 0 → 1)
const opacityAnimation = keyframes({
  '0%': {
    opacity: 0,
    animationTimingFunction: interactionVars.interaction.easing['bezier.inout'],
  },
  [toKeyframePercent(opacityFadeInEndMs)]: {
    opacity: 1,
  },
  [toKeyframePercent(opacityHoldEndMs)]: {
    opacity: 1,
    animationTimingFunction: interactionVars.interaction.easing['bezier.inout'],
  },
  [toKeyframePercent(opacityFadeOutEndMs)]: {
    opacity: 0,
    animationTimingFunction: interactionVars.interaction.easing['bezier.inout'],
  },
  [toKeyframePercent(opacityFadeBackInEndMs)]: {
    opacity: 1,
  },
  '100%': {
    opacity: 1,
  },
});

export const animatedSkeleton = style({
  transformOrigin: 'center',
  animationName: `${scaleAnimation}, ${opacityAnimation}`,
  animationDuration: `${skeletonAnimationDurationMs}ms`,
  animationTimingFunction: 'linear',
  animationIterationCount: 'infinite',
  animationFillMode: 'both',
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      // 화면이 작아진 경우 애니메이션 제거
      transform: 'scale(1)',
      opacity: 1,
      animation: 'none',
    },
  },
});

export const container = style({
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['600'],
  paddingBlock: unitVars.unit.gapPadding['600'],
  paddingInline: unitVars.unit.gapPadding['500'],
  width: '100%',
});

export const outputImagePlaceholder = style({
  backgroundColor: colorVars.color.fill.weak,
});

const skeletonPlaceholder = {
  borderRadius: unitVars.unit.radius['100'],
  backgroundColor: colorVars.color.fill.weak,
  width: '100%',
};

export const outputBrandPlaceholder = style({
  ...skeletonPlaceholder,
  height: '1.1rem',
});

export const outputNamePlaceholder = style({
  ...skeletonPlaceholder,
  height: '2rem',
});

export const outputPricePlaceholder = style({
  ...skeletonPlaceholder,
  maxWidth: '18rem',
  height: '2.4rem',
});

export const similarSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['300'],
  width: '100%',
});

export const similarTitleRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['100'],
});

export const similarTitle = style({
  ...fontVars.font.title_sb_18,
  margin: 0,
  color: colorVars.color.text.primary,
});

export const controls = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  width: '100%',
});

export const chipList = style({
  display: 'flex',
  alignItems: 'center',
  alignSelf: 'stretch',
  gap: unitVars.unit.gapPadding['100'],
});

export const chip = style({
  display: 'block',
  borderRadius: unitVars.unit.radius.full,
  backgroundColor: colorVars.color.fill.weak,
  width: '5.8rem',
  height: '3.6rem',
});

export const productGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: unitVars.unit.gapPadding['200'],
  width: '100%',
});

export const productCard = style([
  animatedSkeleton,
  {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    // 두 번째 카드부터 fastest(150ms) 간격으로 애니메이션을 시작한다.
    selectors: {
      '&:nth-child(2)': {
        animationDelay: interactionVars.interaction.duration.fastest,
      },
      '&:nth-child(3)': {
        animationDelay: `${interactionDurationValues.fastest * 2}ms`,
      },
      '&:nth-child(4)': {
        animationDelay: `${interactionDurationValues.fastest * 3}ms`,
      },
    },
  },
]);

export const productImage = style({
  aspectRatio: '1 / 1',
  flexShrink: 0,
  borderRadius: unitVars.unit.radius['300'],
  backgroundColor: colorVars.color.fill.weak,
  width: '100%',
});

export const productInfo = style({
  paddingTop: unitVars.unit.gapPadding['200'],
  paddingBottom: unitVars.unit.gapPadding['400'],
  width: '100%',
});

export const productTextPlaceholders = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['100'],
  padding: unitVars.unit.gapPadding['050'],
  width: '100%',
});

export const productBrandPlaceholder = style({
  ...skeletonPlaceholder,
  height: '1.1rem',
});

export const productNamePlaceholder = style({
  ...skeletonPlaceholder,
  height: '4.1rem',
});

export const productPricePlaceholder = style({
  ...skeletonPlaceholder,
  height: '2.3rem',
});
