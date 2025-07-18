import { style } from '@vanilla-extract/css';
import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';
import { animationTokens } from '@/shared/styles/tokens/animation.css';

export const container = style({
  background: colorVars.color.bg_grad,
});

export const textbox = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '0.8rem',
  width: '100%',
  textAlign: 'center',
  padding: '4rem 2rem 2rem 2rem',
  color: colorVars.color.gray900,
  animation: animationTokens.fadeInUpFast,
});

export const title = style({
  ...fontStyle('heading_sb_20'),
  color: colorVars.color.gray900,
});

export const content = style({
  ...fontStyle('body_r_14'),
  color: colorVars.color.gray600,
});

export const imgbox = style({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
});

export const signUpImg = style({
  width: '37.5rem',
  height: '34.4rem',
  background: colorVars.color.gray100,
  animation: animationTokens.fadeInUpFast,
});

export const btnarea = style({
  position: 'fixed',
  bottom: '0',
  width: '100%',
  maxWidth: '430px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '1rem',
  padding: '0 2rem 2rem 2rem',
});
