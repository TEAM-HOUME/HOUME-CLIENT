import { style } from '@vanilla-extract/css';

import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';

export const container = style({
  display: 'flex',
  width: '100%',
  height: '7.2rem',
  justifyContent: 'space-between',
  alignItems: 'center',
  textAlign: 'center',
  ...fontStyle('body_r_14'),
  color: colorVars.color.gray900,
});

export const leftdiv = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '7.2rem',
});

export const profileicon = style({
  cursor: 'pointer',
  padding: '0 1.6rem',
});

export const rightdiv = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minWidth: '8rem',
  height: '4.8rem',
  padding: '1.2rem 1.6rem',
});
