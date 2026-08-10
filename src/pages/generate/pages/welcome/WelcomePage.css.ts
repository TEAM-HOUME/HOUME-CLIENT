import { style } from '@vanilla-extract/css';

import { animationTokens } from '@styles/tokensV2/animation.css';
import { unitVars } from '@styles/tokensV2/unit.css';

import { colorVars } from '@/shared/styles/tokensV2/color.css';
import { fontVars } from '@/shared/styles/tokensV2/font.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: colorVars.color.bg.primary,
  width: '100%',
  height: '100%',
});

export const contents = style({
  gap: unitVars.unit.gapPadding['200'],
  background: colorVars.color.bg.primary,
  padding: `${unitVars.unit.gapPadding['500']} ${unitVars.unit.gapPadding['000']}`,
  animation: animationTokens.fadeInUpFast,
});

export const imgbox = style({
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
});

export const signupLottie = style({
  width: '37.5rem',
  height: '37.5rem',
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

export const btnarea = style({
  position: 'fixed',
  bottom: '0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: unitVars.unit.gapPadding['100'],
  background: `linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, #FFF 100%)`,
  padding: unitVars.unit.gapPadding['500'],
  width: '100%',
  maxWidth: unitVars.unit.dimension.wMax,
});
