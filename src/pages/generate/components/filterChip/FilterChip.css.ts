import { recipe } from '@vanilla-extract/recipes';

import { fontStyle } from '@styles/fontStyle';
import { colorVars } from '@styles/tokens/color.css';

export const filterChip = recipe({
  base: {
    height: '3.6rem',
    padding: '0rem 1.4rem',
    textAlign: 'center',
    borderRadius: '999px',
    ...fontStyle('body_r_14'),
    color: colorVars.color.gray500,
    border: `1px solid ${colorVars.color.gray300}`,
    transition:
      'color 0.2s ease-in-out, background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
  },
  variants: {
    selected: {
      true: {
        ...fontStyle('body_m_14'),
        backgroundColor: colorVars.color.primary_light2,
        color: colorVars.color.primary,
        border: `1px solid ${colorVars.color.primary}`,
      },
      false: {},
    },
  },
  defaultVariants: {
    selected: false,
  },
});
