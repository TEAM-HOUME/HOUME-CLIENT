import { style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { unitVars } from '@styles/tokens/unit.css';

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: unitVars.unit.gapPadding['400'],
  width: '100%',
});

export const headerRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
});

export const sectionTitle = style({
  ...fontVars.font.title_sb_16,
  padding: `0 ${unitVars.unit.gapPadding['100']}`,
  color: colorVars.color.text.primary,
});

export const cardGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: unitVars.unit.gapPadding['200'],
  width: '100%',
});
