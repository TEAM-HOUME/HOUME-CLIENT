import { style } from '@vanilla-extract/css';

import { colorVars } from '@/shared/styles/tokens/color.css';

export const divider = style({
  width: '100%',
  height: '0.1rem',
  backgroundColor: colorVars.color.gray100,
});
