import { style } from '@vanilla-extract/css';
import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';
import { animationTokens } from '@/shared/styles/tokens/animation.css';

export const wrapper = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  textAlign: 'center',
  alignSelf: 'stretch',
});

export const titleWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  animation: animationTokens.fadeInUpSlow,
});

export const title = style({
  ...fontStyle('heading_sb_20'),
  color: colorVars.color.gray900,
  textAlign: 'left',
  marginBottom: '0.8rem',
});

export const description = style({
  ...fontStyle('body_r_14'),
  color: colorVars.color.gray600,
  textAlign: 'left',
  marginBottom: '4rem',
});

export const radioImageBox = style({
  width: '100%',
  borderRadius: '16px',
  aspectRatio: '3 / 2',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: '1.6rem',
  overflow: 'hidden',
});

export const radioImage = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center',
  display: 'block',
  boxSizing: 'border-box',
});

export const buttonGroup = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '0.7rem',
  width: '100%',
});

export const radioButtonLabel = style({
  display: 'flex',
  flex: '0 0 calc((100% - 2.1rem) / 4)',
  minWidth: '6rem',
  maxWidth: '10rem',
  cursor: 'pointer',
});

export const radioButton = style({
  display: 'none',
});
