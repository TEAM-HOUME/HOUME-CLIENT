import { style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { unitVars } from '@styles/tokens/unit.css';

export const content = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

export const title = style({
  ...fontVars.font.title_sb_16,
  marginBottom: unitVars.unit.gapPadding['200'],
  textAlign: 'center',
  color: colorVars.color.text.primary,
});

export const detail = style({
  ...fontVars.font.title_r_15,
  textAlign: 'center',
  color: colorVars.color.text.secondary,
});
