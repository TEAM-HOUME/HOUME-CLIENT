import { style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { unitVars } from '@styles/tokens/unit.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['600'],
  padding: unitVars.unit.gapPadding['500'],
  width: '100%',
});

export const header = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['200'],
});

export const title = style({
  margin: 0,
  color: colorVars.color.text.primary,
  ...fontVars.font.title_sb_18,
});

export const description = style({
  margin: 0,
  color: colorVars.color.text.secondary,
  ...fontVars.font.body_r_14,
});

export const contents = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['700'],
});

export const itemList = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: unitVars.unit.gapPadding['200'],
  margin: 0,
  padding: 0,
  listStyle: 'none',
});

export const item = style({
  width: '100%',
  minWidth: 0,
});
