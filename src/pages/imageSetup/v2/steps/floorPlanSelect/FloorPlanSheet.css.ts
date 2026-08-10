import { style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { unitVars } from '@styles/tokens/unit.css';

export const content = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['300'],
  paddingBottom: unitVars.unit.gapPadding['300'],
});

export const mirrorWrapper = style({
  transition: 'transform 200ms ease',
  width: '100%',
});

export const mirrored = style({
  transform: 'scaleX(-1)',
});

export const viewLabel = style({
  margin: 0,
  color: colorVars.color.text.tertiary,
  ...fontVars.font.body_r_14,
});

export const titleRow = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['100'],
});

export const titleIcon = style({
  flexShrink: 0,
  width: '1.6rem',
  height: '1.6rem',
});

export const titleMain = style({
  whiteSpace: 'nowrap',
  color: colorVars.color.text.primary,
  ...fontVars.font.title_m_16,
});

export const titleMeta = style({
  whiteSpace: 'nowrap',
  color: colorVars.color.text.tertiary,
  ...fontVars.font.title_r_15,
});

export const swiperContainer = style({
  aspectRatio: '3 / 2',
  position: 'relative',
  borderRadius: unitVars.unit.radius['600'],
  width: '100%',
  overflow: 'hidden',
});

export const slide = style({
  position: 'relative', // OptimizedImage placeholder(absolute)의 기준
});

export const slideImage = style({
  aspectRatio: '3 / 2',
  objectFit: 'cover',
  width: '100%',
});

const navButtonBase = style({
  position: 'absolute',
  zIndex: 1,
  top: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
});

export const navButtonPrev = style([
  navButtonBase,
  { left: unitVars.unit.gapPadding['200'] },
]);

export const navButtonNext = style([
  navButtonBase,
  { right: unitVars.unit.gapPadding['200'] },
]);
