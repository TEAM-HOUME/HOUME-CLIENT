import { recipe } from '@vanilla-extract/recipes';
import { colorVars } from '@styles/tokens/color.css';
import { fontStyle } from '@/shared/styles/fontStyle';

export const likeButton = recipe({
  base: {
    width: '100%',
    minWidth: '12.8rem',
    height: '4rem',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.8rem',
    borderRadius: '6px',
    ...fontStyle('body_r_14'),
    color: colorVars.color.gray800,
    transition: 'all 0.2s ease-in-out',
    border: 'none',

    backgroundColor: colorVars.color.gray100,
    ':active': {
      backgroundColor: colorVars.color.gray300,
    },
  },
  variants: {
    selected: {
      true: {
        ...fontStyle('body_m_14'),
        backgroundColor: colorVars.color.primary_light2,
        color: colorVars.color.primary,
      },
      false: {},
    },
    size: {
      small: {},
      large: {
        width: '14rem',
        height: '4.8rem',
      },
    },
  },
  defaultVariants: {
    selected: false,
    size: 'small',
  },
});
