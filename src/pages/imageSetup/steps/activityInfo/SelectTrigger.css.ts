import { style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { pressInteraction } from '@styles/tokens/interaction/presets';
import { unitVars } from '@styles/tokens/unit.css';

export const trigger = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  transformOrigin: 'center center',
  ...pressInteraction(0.97),
  border: 'none',
  borderRadius: unitVars.unit.radius.full,
  backgroundColor: colorVars.color.fill.weak,
  cursor: 'pointer',
  padding: `${unitVars.unit.gapPadding['300']} ${unitVars.unit.gapPadding['400']}`,
  width: '100%',
  height: '4.8rem',
});

export const leftContainer = style({
  display: 'flex',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['100'],
});

export const labelContainer = style({
  display: 'flex',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['100'],
  padding: `0 ${unitVars.unit.gapPadding['100']}`,
});

export const placeholderLabel = style({
  ...fontVars.font.body_r_14,
  color: colorVars.color.text.secondary,
});

export const selectedLabel = style({
  ...fontVars.font.body_m_14,
  color: colorVars.color.text.primary,
});

export const requiredLabel = style({
  ...fontVars.font.body_m_14,
  color: colorVars.color.text.secondary,
});

export const divider = style({
  margin: '0.15rem',
  borderRadius: '50%',
  backgroundColor: colorVars.color.text.secondary,
  width: '0.3rem',
  height: '0.3rem',
});
