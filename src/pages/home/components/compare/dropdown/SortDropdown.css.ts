import { style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { pressInteraction } from '@styles/tokens/interaction/presets';
import { unitVars } from '@styles/tokens/unit.css';
import { zIndex } from '@styles/tokens/zIndex';

export const container = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
});

export const pressable = style({
  ...pressInteraction(0.97, '&:not(:disabled):active'),
});

export const menu = style({
  boxSizing: 'border-box',
  position: 'absolute',
  zIndex: zIndex.popup,
  top: `calc(100% + ${unitVars.unit.gapPadding['100']})`,
  right: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: unitVars.unit.gapPadding['050'],
  border: `1px solid ${colorVars.color.border.primary}`,
  borderRadius: unitVars.unit.radius['200'],
  backgroundColor: colorVars.color.fill.inverse,
  padding: unitVars.unit.gapPadding['200'],
  width: '11.6rem',
  overflow: 'hidden',
});

export const item = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: unitVars.unit.gapPadding['050'],
  width: '100%',
});
