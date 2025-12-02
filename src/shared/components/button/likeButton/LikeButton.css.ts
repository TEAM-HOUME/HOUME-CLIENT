import { recipe } from '@vanilla-extract/recipes';

import { fontStyle } from '@/shared/styles/fontStyle';

import { colorVars } from '@styles/tokens/color.css';

export const likeButton = recipe({
  base: {
    width: '100%',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    transition: 'all 0.2s ease-in-out',
    border: 'none',

    ':active': {
      backgroundColor: colorVars.color.gray300,
    },
  },
  variants: {
    type: {
      // loading
      withText: {
        width: '14rem',
        height: '4.8rem',
        gap: '0.4rem',
        borderRadius: '6px',
        ...fontStyle('body_r_14'),
        color: colorVars.color.gray800,
        backgroundColor: colorVars.color.gray100,
      },
      // result
      onlyIcon: {
        width: '4rem',
        height: '4rem',
        borderRadius: '999px',
        backgroundColor: colorVars.color.gray000,
      },
    },
    selected: {
      true: {},
      false: {},
    },
    disabled: {
      true: {
        cursor: 'not-allowed',
      },
      false: {},
    },
  },
  compoundVariants: [
    // withText + selected
    {
      variants: { type: 'withText', selected: true },
      style: {
        ...fontStyle('body_m_14'),
        backgroundColor: colorVars.color.primary_light2,
        color: colorVars.color.primary,
      },
    },
  ],
  defaultVariants: {
    selected: false,
    type: 'withText',
    disabled: false,
  },
});
