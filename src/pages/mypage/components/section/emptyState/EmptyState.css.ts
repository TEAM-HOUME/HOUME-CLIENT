import { style } from '@vanilla-extract/css';

import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
});

export const image = style({
  width: '37.5rem',
  height: '22rem',
});

export const contentWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1.6rem',
});

export const textWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '1.6rem 2rem',
  gap: '1.2rem',
});

export const title = style({
  ...fontStyle('title_sb_16'),
  width: '14.9rem',
  height: '1.6rem',
  textAlign: 'center',
  color: colorVars.color.gray999,
});

export const description = style({
  ...fontStyle('body_r_14'),
  width: '18.2rem',
  height: 'auto',
  minHeight: '2.1rem',
  textAlign: 'center',
  color: colorVars.color.gray700,
  whiteSpace: 'pre-line',
});
