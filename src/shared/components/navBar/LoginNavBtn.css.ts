import { style } from '@vanilla-extract/css';

import { colorVars } from '@/shared/styles/tokens/color.css';

export const loginNav = style({
  textAlign: 'center',
  color: colorVars.color.gray900,
  textDecoration: 'underline',
  textUnderlineOffset: '3px',
});
