import { style } from '@vanilla-extract/css';

import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';

export const container = style({
  width: '100%',
  padding: '2.4rem 2rem 0 2rem',
});

export const section = style({
  marginBottom: '4rem',
});

export const sectionTitle = style({
  ...fontStyle('title_sb_16'),
  color: colorVars.color.gray800,
  marginBottom: '1.6rem',
});

export const buttonArea = style({
  display: 'block',
  margin: 0,
  padding: 0,
  listStyle: 'none',
  borderTop: `0.1rem solid ${colorVars.color.gray100}`,
});

export const buttonItem = style({
  display: 'block',
  padding: '1.2rem 0',
  borderBottom: `0.1rem solid ${colorVars.color.gray100}`,
});

export const settingButton = style({
  display: 'flex',
  width: '100%',
  padding: 0,
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'left',
});

export const buttonText = style({
  ...fontStyle('body_r_14'),
  color: colorVars.color.gray600,
});
