import { style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { unitVars } from '@styles/tokens/unit.css';

export const root = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

export const mainArea = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['800'],
  padding: unitVars.unit.gapPadding['500'],
  width: '100%',
});

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['400'],
  width: '100%',
});

export const sectionHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `0 ${unitVars.unit.gapPadding['100']}`,
});

export const sectionTitle = style({
  ...fontVars.font.title_sb_16,
  color: colorVars.color.text.primary,
});

export const flexContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['200'],
  width: '100%',
});

export const gridContent = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: unitVars.unit.gapPadding['200'],
  width: '100%',
});

export const blockSlot = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
});

export const listLoadingSlot = style([
  blockSlot,
  {
    minHeight: '12rem',
  },
]);

export const gridLoadingSlot = style({
  display: 'flex',
  gridColumn: '1 / -1',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minHeight: '22rem',
});
