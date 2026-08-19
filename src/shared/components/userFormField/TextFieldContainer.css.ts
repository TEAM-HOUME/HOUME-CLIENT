import { style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { pressInteraction } from '@styles/tokens/interaction/presets';
import { unitVars } from '@styles/tokens/unit.css';

export const fieldWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['100'],
  width: '100%',
});

export const fieldBox = style({
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  transformOrigin: 'center center',
  ...pressInteraction(0.97, '&:active, &:has(:active)'),
  border: `1px solid ${colorVars.color.border.primary}`,
  borderRadius: unitVars.unit.radius['300'],
  backgroundColor: colorVars.color.fill.inverse,
  padding: unitVars.unit.gapPadding['200'],
  width: '100%',
  height: '4.4rem',
});

export const focused = style({
  borderColor: colorVars.color.border.strong,
});

export const errorMessage = style({
  display: 'flex',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['100'],
  ...fontVars.font.caption_r_12,
  color: colorVars.color.text.danger,
});
