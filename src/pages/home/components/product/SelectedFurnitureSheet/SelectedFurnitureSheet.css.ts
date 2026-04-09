import { style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokensV2/color.css';
import { fontVars } from '@styles/tokensV2/font.css';
import { unitVars } from '@styles/tokensV2/unit.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['300'],
  width: '100%',
});

export const headerRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['100'],
  padding: `${unitVars.unit.gapPadding['000']} ${unitVars.unit.gapPadding['200']}`,
});

export const title = style({
  color: colorVars.color.text.primary,
  ...fontVars.font.title_sb_18,
});

export const count = style({
  color: colorVars.color.text.tertiary,
  ...fontVars.font.body_r_14,
});

export const selectedCount = style({
  color: colorVars.color.text.primary,
  ...fontVars.font.title_sb_14,
});

export const compactRow = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(6, 1fr)',
  gap: unitVars.unit.gapPadding['050'],
  width: '100%',
});

export const compactSlot = style({
  aspectRatio: '1 / 1',
  border: `1px solid ${colorVars.color.border.tertiary}`,
  borderRadius: unitVars.unit.radius['300'],
  backgroundColor: colorVars.color.bg.primary,
});

export const expandedGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: unitVars.unit.gapPadding['200'],
  width: '100%',
});

export const addCard = style({
  aspectRatio: '1 / 1',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px solid ${colorVars.color.border.tertiary}`,
  borderRadius: unitVars.unit.radius['300'],
  backgroundColor: colorVars.color.bg.primary,
});

export const addCardContent = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: unitVars.unit.gapPadding['100'],
});

export const addLabel = style({
  margin: 0,
  ...fontVars.font.caption_r_12,
  color: colorVars.color.text.disabled,
});
