import { style } from '@vanilla-extract/css';
import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';
import { animationTokens } from '@/shared/styles/tokens/animation.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
});

export const margin = style({
  marginTop: '1.6rem',
});

// step1
export const wrapper = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4rem',
  padding: '2rem',
  width: '100%',
});

export const optionGroupWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  animation: animationTokens.fadeInUpFast,
});

// step4의 '가구'를 감싸는 wrapper
export const subWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '2.4rem',
  animation: animationTokens.fadeInUpFast,
});

export const subOptionGroupWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.2rem',
});

export const selectBox = style({
  display: 'flex',
  flexDirection: 'column',
});

export const mainTextBox = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.6rem',
});

export const title = style({
  ...fontStyle('title_sb_16'),
  color: colorVars.color.gray800,
});

export const body = style({
  ...fontStyle('caption_r_12'),
  color: colorVars.color.gray500,
});

export const subTextBox = style({
  display: 'flex',
  gap: '0.4rem',
  alignItems: 'center',
});

export const subtitle = style({
  ...fontStyle('body_m_14'),
  color: colorVars.color.gray700,
});

export const caption = style({
  ...fontStyle('caption_r_12'),
  color: colorVars.color.gray500,
});

export const count = style({
  ...fontStyle('caption_m_12'),
  color: colorVars.color.gray900,
  padding: '0 0.1rem',
});

export const slash = style({
  paddingRight: '0.1rem',
});

export const buttonBox = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '0.7rem',
});
