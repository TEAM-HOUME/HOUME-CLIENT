import { style } from '@vanilla-extract/css';

import { animationTokens } from '@styles/tokens/animation.css';
import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { unitVars } from '@styles/tokens/unit.css';

export const wrapper = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['700'],
  padding: unitVars.unit.gapPadding['500'],
  width: '100%',
});

export const header = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['500'],
});

export const iconContainer = style({
  display: 'flex',
  gap: unitVars.unit.gapPadding['050'],
  width: '100%',
});

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: unitVars.unit.gapPadding['600'],
  width: '100%',
  animation: animationTokens.fadeInUp,
});

export const title = style({
  width: '100%',
  ...fontVars.font.title_sb_20,
  color: colorVars.color.text.primary,
});

export const fieldbox = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
});

export const fieldtitle = style({
  marginBottom: unitVars.unit.gapPadding['300'],
  padding: unitVars.unit.gapPadding['100'],
  ...fontVars.font.title_sb_16,
  width: '100%',
  color: colorVars.color.text.primary,
});

export const flexbox = style({
  display: 'flex',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['200'],
  width: '100%',
});

export const popupContent = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

export const popupTitle = style({
  ...fontVars.font.title_sb_16,
  marginBottom: unitVars.unit.gapPadding['200'],
  textAlign: 'center',
  color: colorVars.color.text.primary,
});

export const popupDetail = style({
  ...fontVars.font.body_r_14,
  textAlign: 'center',
  wordBreak: 'keep-all',
  color: colorVars.color.text.secondary,
});

export const btnarea = style({
  position: 'fixed',
  bottom: '0',
  left: '50%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: unitVars.unit.gapPadding['100'],
  transform: 'translateX(-50%)',
  background: `linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, #FFF 100%)`,
  padding: unitVars.unit.gapPadding['500'],
  width: '100%',
  maxWidth: unitVars.unit.dimension.wMax,
});
