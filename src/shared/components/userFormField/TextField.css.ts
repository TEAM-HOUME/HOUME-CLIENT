import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { unitVars } from '@styles/tokens/unit.css';

export const wrapper = style({
  display: 'flex',
  gap: unitVars.unit.gapPadding['200'],
  width: '100%',
});

export const input = recipe({
  base: {
    flex: 1,
    outline: 'none',
    paddingInline: unitVars.unit.gapPadding['200'],
    ...fontVars.font.body_r_14,
    minWidth: 0,
    color: colorVars.color.text.primary,
    selectors: {
      '&::placeholder': {
        color: colorVars.color.text.tertiary,
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

export const refreshBtnContainer = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px solid ${colorVars.color.border.primary}`,
  borderRadius: unitVars.unit.radius['300'],
  backgroundColor: colorVars.color.fill.inverse,
  width: '4.4rem',
  height: '4.4rem',
});
