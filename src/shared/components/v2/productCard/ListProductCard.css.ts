import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { colorVars } from '@shared/styles/tokensV2/color.css';
import { fontVars } from '@shared/styles/tokensV2/font.css';
import { unitVars } from '@shared/styles/tokensV2/unit.css';

import {
  SKELETON_GRADIENT,
  animationTokens,
} from '@styles/tokens/animation.css';

export const wrapper = recipe({
  base: {
    position: 'relative',
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    width: '100%',
  },
  variants: {
    size: {
      s: {
        gap: unitVars.unit.gapPadding['100'],
        padding: unitVars.unit.gapPadding['000'],
        maxWidth: '27.6rem',
      },
      m: {
        gap: unitVars.unit.gapPadding['200'],
        padding: unitVars.unit.gapPadding['000'],
        minWidth: '33.5rem',
      },
    },
  },
});

export const clickable = style({
  cursor: 'pointer',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${colorVars.color.text.brand}`,
      outlineOffset: '2px',
      borderRadius: '0.8rem',
    },
  },
});

export const imgSection = recipe({
  base: {
    aspectRatio: '1 / 1', // 내부 absolute(링크 버튼)의 기준
    position: 'relative', // 모서리 밖으로 이미지 안 튀어나오게
    flexShrink: 0,
    border: `1px solid ${colorVars.color.border.tertiary}`,
    background: 'transparent',
    overflow: 'hidden',
  },
  variants: {
    size: {
      s: { borderRadius: unitVars.unit.radius['200'] },
      m: { borderRadius: unitVars.unit.radius['300'] },
    },
  },
});

export const cardImage = recipe({
  base: {
    boxSizing: 'border-box',
    display: 'block',
    transition: 'opacity 0.3s ease-in-out',
    objectFit: 'cover',
    objectPosition: 'center',
    width: '100%',
    height: '100%',
  },
  variants: {
    loaded: {
      true: { opacity: 1 },
      false: { opacity: 0 },
    },
    size: {
      s: { width: '5.2rem' },
      m: { width: '8rem' },
    },
  },
  defaultVariants: {
    loaded: false,
  },
});

export const skeleton = style({
  position: 'absolute',
  inset: 0,
  background: SKELETON_GRADIENT,
  backgroundSize: '200% 100%',
  animation: `${animationTokens.skeletonWave} 2s linear infinite`,
});

export const infoSection = recipe({
  base: {
    position: 'relative',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    flexShrink: 0,
    padding: `${unitVars.unit.gapPadding['000']} ${unitVars.unit.gapPadding['100']}`,
  },
  variants: {
    size: {
      s: { gap: unitVars.unit.gapPadding['050'], minWidth: '22rem' },
      m: { gap: unitVars.unit.gapPadding['100'], minWidth: '26.1rem' },
    },
  },
});

export const colorRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['050'],
});

export const colorChipContainer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.1rem',
  width: '1.4rem',
  height: '1.4rem',
});

export const colorChip = style({
  boxSizing: 'border-box',
  border: `0.5px solid ${colorVars.color.border.weak}`,
  borderRadius: unitVars.unit.radius.full,
  width: '1.2rem',
  height: '1.2rem',
});

export const colorChipCount = style({
  ...fontVars.font.caption_r_12,
  color: colorVars.color.text.tertiary,
});

export const productInfo = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['100'],
});

export const productText = style({
  ...fontVars.font.body_r_14,
  maxHeight: '2rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: colorVars.color.text.primary,
});

export const priceSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['100'],
});

export const originalPriceText = style({
  ...fontVars.font.title_sb_14,
  color: colorVars.color.text.primary,
});

export const discountRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['050'],
});

export const discountRateText = style({
  ...fontVars.font.title_sb_14,
  color: colorVars.color.text.brand,
});

export const discountPriceText = style({
  ...fontVars.font.title_sb_14,
  color: colorVars.color.text.primary,
});

export const btnContainer = recipe({
  base: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    display: 'flex',
    padding: `${unitVars.unit.gapPadding['000']} ${unitVars.unit.gapPadding['050']}`,
  },
});
