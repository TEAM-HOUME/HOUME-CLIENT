import { recipe } from '@vanilla-extract/recipes';

import { fontStyle } from '@/shared/styles/fontStyle';

import { colorVars } from '@styles/tokens/color.css';

export const linkButton = recipe({
  base: {
    width: '100%',
    height: '3rem',
    padding: '0.6rem',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '999px',

    transition: 'all 0.2s ease-in-out',
    border: `1px solid ${colorVars.color.gray300}`,
    backgroundColor: colorVars.color.gray000,

    ':active': {
      backgroundColor: colorVars.color.gray300,
    },
  },
  variants: {
    type: {
      withText: {
        width: '6.5rem',
        gap: '0.3rem',
        ...fontStyle('caption_r_12'),
        color: colorVars.color.gray700,
      },
      onlyIcon: {
        width: '3rem',
      },
    },
  },
  defaultVariants: {
    type: 'withText',
  },
});
