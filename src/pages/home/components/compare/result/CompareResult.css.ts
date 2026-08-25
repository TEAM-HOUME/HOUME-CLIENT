import { style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { unitVars } from '@styles/tokens/unit.css';

export const container = style({
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['600'],
  paddingBlock: unitVars.unit.gapPadding['600'],
  paddingInline: unitVars.unit.gapPadding['500'],
  width: '100%',
});

export const productSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['300'],
});

export const titleRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['100'],
});

export const title = style({
  ...fontVars.font.title_sb_18,
  margin: 0,
  color: colorVars.color.text.primary,
});

export const productCount = style({
  ...fontVars.font.title_sb_18,
  color: colorVars.color.text.brand, // 생상 확인 필요
});

export const sortRow = style({
  display: 'flex',
  justifyContent: 'flex-end',
});

export const productGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: unitVars.unit.gapPadding['200'],
});

export const bottomContents = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['700'],
});

export const notice = style({
  ...fontVars.font.body_r_13,
  display: 'flex',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['100'],
  margin: 0,
  width: '100%',
  color: colorVars.color.text.tertiary,
});
