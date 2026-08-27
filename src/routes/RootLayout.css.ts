import { style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';

export const container = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  backgroundColor: colorVars.color.gray000,
});
