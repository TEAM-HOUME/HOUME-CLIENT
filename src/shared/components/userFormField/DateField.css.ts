import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { unitVars } from '@styles/tokens/unit.css';

export const dateRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: unitVars.unit.gapPadding['200'],
  width: '100%',
});

export const dateInput = recipe({
  base: {
    outline: 'none',
    width: '6.34rem',
    minWidth: 0,
    textAlign: 'center',
    color: colorVars.color.text.primary,
    ...fontVars.font.body_r_14,

    selectors: {
      '&::placeholder': {
        color: colorVars.color.text.tertiary,
      },
      '&:focus::placeholder': {
        color: 'transparent',
      },
    },
  },
  variants: {
    isErrorText: {
      false: {},
      true: {
        caretColor: colorVars.color.text.primary,
        color: colorVars.color.text.danger,
      },
    },
  },
});

export const divider = style({
  flexShrink: 0,
  backgroundColor: colorVars.color.border.primary,
  width: '0.1rem',
  height: '1.2rem',
});
