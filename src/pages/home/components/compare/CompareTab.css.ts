import { style } from '@vanilla-extract/css';

import { unitVars } from '@styles/tokens/unit.css';

export const container = style({
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  alignSelf: 'stretch',
  width: '100%',
  minWidth: 0,
  maxWidth: unitVars.unit.dimension.wMax,
});

export const content = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});
