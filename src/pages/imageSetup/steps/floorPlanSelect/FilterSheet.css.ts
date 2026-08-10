import { style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { unitVars } from '@styles/tokens/unit.css';

export const content = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['600'],
  paddingBottom: unitVars.unit.gapPadding['300'],
});

export const title = style({
  margin: 0,
  color: colorVars.color.text.primary,
  ...fontVars.font.title_sb_16,
});

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['300'],
});

export const sectionTitle = style({
  margin: 0,
  color: colorVars.color.text.primary,
  ...fontVars.font.title_m_16,
});

export const chipGroup = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: unitVars.unit.gapPadding['100'],
});
