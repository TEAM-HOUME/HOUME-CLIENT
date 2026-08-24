import { style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { pressInteraction } from '@styles/tokens/interaction/presets';
import { unitVars } from '@styles/tokens/unit.css';

export const wrapper = style({
  display: 'flex',
  gap: unitVars.unit.gapPadding['200'],
  transformOrigin: 'center center',
  ...pressInteraction(0.97, '&:active, &:has(:active)'),
  borderRadius: unitVars.unit.radius['600'],
  backgroundColor: colorVars.color.fill.whitish,
  padding: unitVars.unit.gapPadding['100'],
  width: '100%',
});

export const field = style({
  boxSizing: 'border-box',
  display: 'block',
  flex: 1,
  outline: 'none',
  border: 0,
  backgroundColor: 'transparent',
  padding: `${unitVars.unit.gapPadding['200']} ${unitVars.unit.gapPadding['300']}`,
  width: '100%',
  minWidth: 0,
  minHeight: '8.4rem',
  overflow: 'hidden',
  resize: 'none',
  color: colorVars.color.text.primary,
  ...fontVars.font.body_r_14,
  selectors: {
    '&::placeholder': {
      color: colorVars.color.text.tertiary,
    },
  },
});

export const buttonArea = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'flex-end',
});

export const submit = style({
  flexShrink: 0,
  selectors: {
    '&:not(:disabled):active': {
      transform: 'none',
    },
    '&:disabled': {
      opacity: 1,
      cursor: 'default',
    },
  },
});
