import { style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';

export const page = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
});

export const contents = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: colorVars.color.gray000,
  width: '100%',
});

export const tabContentView = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  minHeight: '20rem',
});
