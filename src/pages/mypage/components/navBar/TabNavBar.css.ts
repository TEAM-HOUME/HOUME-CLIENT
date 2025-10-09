import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { fontStyle } from '@/shared/styles/fontStyle';

import { colorVars } from '@styles/tokens/color.css';

export const tabNavBar = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

export const tabButton = recipe({
  base: {
    display: 'flex',
    width: '18.8rem',
    height: '5rem',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    padding: 0,

    '::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '0.2rem',
    },
  },
  variants: {
    state: {
      active: {
        color: colorVars.color.gray800,
        ...fontStyle('title_sb_16'),
        '::after': {
          backgroundColor: colorVars.color.gray800,
        },
      },
      inactive: {
        color: colorVars.color.gray100,
        ...fontStyle('title_m_16'),
        '::after': {
          backgroundColor: colorVars.color.gray500,
        },
      },
    },
  },
  defaultVariants: {
    state: 'inactive',
  },
});

export const tabButtonText = style({
  whiteSpace: 'nowrap',
});
