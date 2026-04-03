import { style } from '@vanilla-extract/css';

import { fontStyle } from '@styles/fontStyle';
import { animationTokens } from '@styles/tokens/animation.css';
import { colorVars } from '@styles/tokens/color.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: colorVars.color.gray000,
  width: '100%',
  height: '100%',
});

export const contents = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2rem',
  paddingTop: '4rem',
  width: '100%',
  animation: animationTokens.fadeInUpFast,
});

export const imgbox = style({
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
});

export const signUpImg = style({
  width: '37.5rem',
  height: '34.4rem',
});

export const textbox = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.8rem',
  padding: '2rem',
  width: '100%',
  textAlign: 'center',
});

export const title = style({
  ...fontStyle('heading_sb_20'),
  color: colorVars.color.gray900,
});

export const content = style({
  ...fontStyle('body_r_14'),
  color: colorVars.color.gray500,
});

export const btnarea = style({
  position: 'fixed',
  bottom: '0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1rem',
  padding: '0 2rem 2rem 2rem',
  width: '100%',
  maxWidth: '430px',
});
