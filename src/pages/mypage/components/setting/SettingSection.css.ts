import { style } from '@vanilla-extract/css';
import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  padding: '4.4rem 2rem 6rem 2rem',
  alignItems: 'flex-start',
  alignSelf: 'stretch',
});

export const title = style({
  ...fontStyle('title_sb_16'),
  color: colorVars.color.gray800,
  padding: '0rem 2rem 2.4rem',
});

export const buttonArea = style({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'stretch',
});

export const settingButton = style({
  display: 'flex',
  alignItems: 'center',
  height: '4rem',
  padding: '1.2rem 2rem',
  gap: '1rem',
});

export const buttonText = style({
  ...fontStyle('body_r_14'),
  color: colorVars.color.gray600,
});

export const divider = style({
  width: '100%',
  height: '0.1rem',
  backgroundColor: colorVars.color.gray100,
});
