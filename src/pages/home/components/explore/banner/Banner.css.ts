import { style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokensV2/color.css';
import { fontVars } from '@styles/tokensV2/font.css';
import { unitVars } from '@styles/tokensV2/unit.css';
import { zIndex } from '@styles/tokensV2/zIndex';

export const root = style({
  boxSizing: 'border-box',
  aspectRatio: '375 / 280',
  position: 'relative',
  alignSelf: 'stretch',
  width: '100%',
  minWidth: unitVars.unit.dimension.wMin,
  maxWidth: unitVars.unit.dimension.wMax,
  height: 'auto',
});

export const swiperWrapper = style({
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  width: '100%',
  height: '100%',
});

export const bannerSwiper = style({
  width: '100%',
  height: '100%',
});

export const swiperSlide = style({
  position: 'relative',
  cursor: 'pointer',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
});

export const slidePlaceholder = style({
  width: '100%',
  height: '100%',
});

export const wrapper = style({
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
});

export const image = style({
  objectFit: 'cover',
  width: '100%',
  height: '100%',
});

export const gradientOverlay = style({
  position: 'absolute',
  inset: 0,
  background:
    'var(--grad-banner, linear-gradient(180deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 56%, rgba(0, 0, 0, 0) 100%))',
});

export const contentOverlay = style({
  position: 'absolute',
  zIndex: zIndex.text,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  pointerEvents: 'none',
  padding: unitVars.unit.gapPadding['600'],
});

export const content = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: unitVars.unit.gapPadding['200'],
  width: '100%',
  height: '100%',
});

export const title = style({
  width: '100%',
  color: colorVars.color.text.inverse,
  ...fontVars.font.title_sb_20,
});

export const cta = style({
  display: 'flex',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['100'],
  width: '100%',
  color: colorVars.color.text.inverseSecondary,
  ...fontVars.font.body_m_13,
});

export const indicatorOverlay = style({
  position: 'absolute',
  zIndex: zIndex.text,
  right: 0,
  bottom: 0,
  left: 0,
  display: 'flex',
  padding: unitVars.unit.gapPadding['600'],
});

export const indicator = style({
  gap: unitVars.unit.gapPadding['100'],
  ...fontVars.font.body_m_13,
  width: '100%',
  textAlign: 'right',
});

export const indicatorCurrent = style({
  color: colorVars.color.text.inverse,
});

export const indicatorSeparator = style({
  color: colorVars.color.text.inverseSecondary,
});

export const indicatorTotal = style({
  color: colorVars.color.text.inverseSecondary,
});
