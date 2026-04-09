import { style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokensV2/color.css';
import { fontVars } from '@styles/tokensV2/font.css';
import { unitVars } from '@styles/tokensV2/unit.css';

export const root = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['200'],
});

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['300'],
});

export const sectionTitle = style({
  textAlign: 'left',
  color: colorVars.color.text.secondary,
  ...fontVars.font.title_m_15,
});

export const chipGroup = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: unitVars.unit.gapPadding['100'],
});

export const colorChipInner = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['100'],
});

export const colorDot = style({
  flexShrink: 0,
  borderWidth: '0.1rem',
  borderStyle: 'solid',
  borderRadius: unitVars.unit.radius.full,
  borderColor: colorVars.color.border.secondary,
  width: '1.2rem',
  height: '1.2rem',
});
