import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { colorVars } from '@shared/styles/tokensV2/color.css';
import { fontVars } from '@shared/styles/tokensV2/font.css';
import { unitVars } from '@shared/styles/tokensV2/unit.css';

import {
  SKELETON_GRADIENT,
  animationTokens,
} from '@styles/tokens/animation.css';
import { zIndex } from '@styles/tokens/zIndex';

export const wrapper = recipe({
  base: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minWidth: '16.6rem',
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
    borderRadius: unitVars.unit.radius['300'], // 이미지 영역만 정사각형
    background: 'transparent',
    width: '100%',
    overflow: 'hidden',
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

export const linkBtnContainer = recipe({
  base: {
    position: 'absolute',
    zIndex: zIndex.button,
    bottom: '0.6rem',
    left: '0.6rem',
  },
});

export const saveBtnOverlay = style({
  position: 'absolute',
  zIndex: zIndex.button,
  top: '0.6rem',
  right: '0.6rem',
});

export const infoSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.8rem',
  paddingTop: unitVars.unit.gapPadding['300'],
  paddingBottom: unitVars.unit.gapPadding['600'],
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

export const middleInfoSection = recipe({
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: unitVars.unit.gapPadding['200'],
    padding: unitVars.unit.gapPadding['050'],
  },
  variants: {
    cardType: {
      default: {},
      shopping: {
        height: '7.2rem',
      },
    },
  },
});

export const productInfo = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['100'],
});

export const brandText = style({
  ...fontVars.font.caption_r_12,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: colorVars.color.text.tertiary,
});

export const productText = style({
  ...fontVars.font.body_r_14,
  display: '-webkit-box',
  maxHeight: '4.1rem',
  overflow: 'hidden',
  wordBreak: 'break-all',
  color: colorVars.color.text.primary,
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
});

export const priceSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['100'],
});

export const originalPriceText = style({
  ...fontVars.font.caption_r_11,
  textDecoration: 'line-through',
  color: colorVars.color.text.tertiary,
});

export const discountRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.1rem',
});

export const discountRateText = style({
  ...fontVars.font.title_sb_15,
  color: colorVars.color.text.brand,
});

export const discountPriceText = style({
  ...fontVars.font.title_sb_15,
  color: colorVars.color.text.primary,
});

export const saveCountRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['050'],
});

export const saveCountText = style({
  ...fontVars.font.caption_r_11,
  color: colorVars.color.gray400,
});
