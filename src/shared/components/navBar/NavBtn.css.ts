import { style } from '@vanilla-extract/css';

import { colorVars } from '@/shared/styles/tokens/color.css';

export const loginNav = style({
  width: '4.8rem',
  height: '4.8rem',
  textAlign: 'center',
  color: colorVars.color.gray900,
  textDecoration: 'underline',
  textUnderlineOffset: '3px',
});

export const settingNav = style({
  width: '3.2rem',
  height: '4.8rem',
  textAlign: 'center',
  color: colorVars.color.gray900,
});
