import { recipe } from '@vanilla-extract/recipes';
import { colorVars } from '@styles/tokens/color.css';
import { fontStyle } from '@/shared/styles/fontStyle';

export const largeFilled = recipe({
  base: {
    width: '16rem',
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
    selected: false,
  },
});
