import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { colorVars } from '@shared/styles/tokensV2/color.css';
import { fontVars } from '@shared/styles/tokensV2/font.css';
import { unitVars } from '@shared/styles/tokensV2/unit.css';

import {
  SKELETON_GRADIENT,
  animationTokens,
} from '@styles/tokensV2/animation.css';
import { zIndex } from '@styles/tokensV2/zIndex';

const skeletonShimmer = style({
  background: SKELETON_GRADIENT,
  backgroundSize: '200% 100%',
  animation: `${animationTokens.skeletonWave} 2s linear infinite`,
});

export const card = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['400'],
});

export const imageWrap = style({
  aspectRatio: '1 / 1',
  position: 'relative',
  flexShrink: 0,
  borderTopLeftRadius: unitVars.unit.radius['300'],
  borderTopRightRadius: unitVars.unit.radius['300'],
  width: '100%',
  overflow: 'hidden',
});

export const image = style({
  display: 'block',
  objectFit: 'cover',
  width: '100%',
  height: '100%',
});

export const linkBtnContainer = recipe({
  base: {
    position: 'absolute',
    zIndex: zIndex.button,
    bottom: unitVars.unit.gapPadding['000'],
    left: unitVars.unit.gapPadding['000'],
    padding: unitVars.unit.gapPadding['200'],
  },
});

export const info = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['200'],
  padding: `${unitVars.unit.gapPadding['000']} ${unitVars.unit.gapPadding['500']} ${unitVars.unit.gapPadding['200']} ${unitVars.unit.gapPadding['500']}`,
  textAlign: 'left',
});

export const metaRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  minHeight: '1.4rem',
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
  border: `1px solid ${colorVars.color.border.weak}`,
  borderRadius: unitVars.unit.radius.full,
  width: '1.2rem',
  height: '1.2rem',
});

export const colorChipCount = style({
  ...fontVars.font.caption_r_12,
  color: colorVars.color.text.tertiary,
});

export const likeRow = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['050'],
});

export const likeCount = style({
  ...fontVars.font.caption_r_11,
  color: colorVars.color.text.tertiary,
});

export const brand = style({
  ...fontVars.font.caption_r_12,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: colorVars.color.text.tertiary,
});

export const title = style({
  ...fontVars.font.body_r_14,
  display: '-webkit-box',
  overflow: 'hidden',
  wordBreak: 'break-all',
  color: colorVars.color.text.primary,
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
});

export const priceSection = style({
  display: 'flex',
  flexDirection: 'column',
  paddingTop: unitVars.unit.gapPadding['100'],
});

export const originalPrice = style({
  ...fontVars.font.caption_r_11,
  textDecoration: 'line-through',
  color: colorVars.color.text.tertiary,
});

export const discountRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.1rem',
});

export const discountRate = style({
  ...fontVars.font.title_sb_15,
  color: colorVars.color.text.brand,
});

export const discountPrice = style({
  ...fontVars.font.title_sb_15,
  color: colorVars.color.text.primary,
});

export const skeletonBrand = style([
  skeletonShimmer,
  brand,
  {
    display: 'block',
    width: '30%',
    minHeight: '1.56rem',
    color: 'transparent',
  },
]);

export const skeletonOriginalPrice = style([
  skeletonShimmer,
  originalPrice,
  {
    display: 'block',
    width: '28%',
    minHeight: '1.43rem',
    color: 'transparent',
  },
]);

export const skeletonDiscountPrice = style([
  skeletonShimmer,
  discountPrice,
  {
    display: 'block',
    width: '40%',
    minHeight: '2.25rem',
    color: 'transparent',
  },
]);
