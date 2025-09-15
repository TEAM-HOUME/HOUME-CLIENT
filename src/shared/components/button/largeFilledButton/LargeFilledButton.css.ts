import { recipe } from '@vanilla-extract/recipes';

import { fontStyle } from '@/shared/styles/fontStyle';

import { colorVars } from '@styles/tokens/color.css';

export const largeFilled = recipe({
  base: {
    width: '100%',
    minWidth: '7.4rem',
    height: '4.8rem',
    padding: '1rem 2rem',
    alignItems: 'center',
    textAlign: 'center',
    borderRadius: '8px',
    transition: 'all 0.2s ease-in-out',
    border: 'none',
    ...fontStyle('body_r_14'),
  },
  variants: {
    state: {
      active: {
        backgroundColor: colorVars.color.gray100,
        ':active': {
          backgroundColor: colorVars.color.gray300,
        },
      },
      disabled: {
        backgroundColor: colorVars.color.gray050,
        color: colorVars.color.gray300,
        cursor: 'not-allowed',
        pointerEvents: 'none',
      },
      error: {
        backgroundColor: colorVars.color.error_light,
        color: colorVars.color.error,
        ...fontStyle('body_m_14'),
      },
    },
    buttonSize: {
      small: {
        height: '3.2rem',
        padding: '0.7rem 0',
        borderRadius: '6px',
        ...fontStyle('caption_r_12'),
      },
      medium: {
        minWidth: '10.7rem',
        textAlign: 'center',
      },
      large: {},
    },
    selected: {
      true: {
        backgroundColor: colorVars.color.primary_light2,
        color: colorVars.color.primary,
        ...fontStyle('body_m_14'),
      },
      false: {},
    },
  },
  defaultVariants: {
    state: 'active',
    buttonSize: 'large',
    selected: false,
  },
});
