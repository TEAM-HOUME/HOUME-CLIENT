import { recipe } from '@vanilla-extract/recipes';
import { colorVars } from '@styles/tokens/color.css';
import { fontStyle } from '@/shared/styles/fontStyle';

export const textField = recipe({
  base: {
    height: '4.9rem',
    padding: '1.4rem 1.2rem',
    borderRadius: '6px',
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    ...fontStyle('body_r_14'),
    boxSizing: 'border-box',

    ':active': {
      backgroundColor: colorVars.color.gray300,
    },

    ':focus': {
      color: colorVars.color.gray900,
      border: `1px solid ${colorVars.color.primary}`,
    },
  },
  variants: {
    state: {
      default: {
        color: colorVars.color.gray400,
        backgroundColor: colorVars.color.gray100,
      },
      filled: {
        backgroundColor: colorVars.color.gray100,
        color: colorVars.color.gray900,
      },
      error: {
        backgroundColor: colorVars.color.error_light,
        color: colorVars.color.error,
      },
    },
    fieldSize: {
      thin: {
        width: '25.9rem',
        height: '3.6rem',
        padding: '0.8rem 1.2rem',
      },
      small: {
        width: '10.7rem',
        textAlign: 'center',
      },
      large: {
        width: '25.9rem',
      },
    },
  },
  defaultVariants: {
    state: 'default',
    fieldSize: 'small',
  },
});
