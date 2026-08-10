import { style } from '@vanilla-extract/css';

import { animationTokens } from '@styles/tokensV2/animation.css';
import { colorVars } from '@styles/tokensV2/color.css';
import { fontVars } from '@styles/tokensV2/font.css';
import { pressInteraction } from '@styles/tokensV2/interaction/presets';

import { unitVars } from '@/shared/styles/tokensV2/unit.css';

export const container = style({
  gap: unitVars.unit.gapPadding['200'],
  background: colorVars.color.bg.primary,
  paddingTop: unitVars.unit.gapPadding['500'],
});

export const textbox = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: unitVars.unit.gapPadding['300'],
  marginTop: unitVars.unit.gapPadding['200'],
  padding: `${unitVars.unit.gapPadding['300']} ${unitVars.unit.gapPadding['500']}`,
  ...fontVars.font.title_sb_20,
  width: '100%',
  animation: animationTokens.fadeInUpFast,
  textAlign: 'center',
});

export const title = style({
  ...fontVars.font.title_sb_20,
  color: colorVars.color.text.primary,
});

export const content = style({
  ...fontVars.font.body_r_14,
  color: colorVars.color.text.secondary,
});

export const imgbox = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
});

export const loginImg = style({
  width: '37.5rem',
  height: '37.5rem',
  animation: animationTokens.fadeInUpFast,
});

export const aside = style({
  ...fontVars.font.caption_r_11,
  color: colorVars.color.gray500,
});

export const link = style({
  cursor: 'pointer',
  textDecoration: 'underline',
  textUnderlineOffset: '2px',
});

export const btnarea = style({
  position: 'fixed',
  bottom: '0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: unitVars.unit.gapPadding['200'],
  background: `linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, #FFF 100%)`,
  padding: unitVars.unit.gapPadding['500'],
  width: '100%',
  maxWidth: unitVars.unit.dimension.wMax,
});

export const buttonWrapper = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
});

export const btn = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: unitVars.unit.gapPadding['200'],
  transformOrigin: 'center center',
  ...pressInteraction(0.97),
  border: 'none',
  borderRadius: unitVars.unit.radius.full,
  backgroundColor: '#FEE500',

  padding: `${unitVars.unit.gapPadding['400']} ${unitVars.unit.gapPadding['600']}`,
  width: '100%',
  minWidth: '16.4rem',
  height: '5.6rem',
  whiteSpace: 'nowrap',
  ...fontVars.font.title_m_16,
  color: colorVars.color.text.primary,
});

export const kakaoIcon = style({
  flexShrink: 0,
});

export const kakaoText = style({});
