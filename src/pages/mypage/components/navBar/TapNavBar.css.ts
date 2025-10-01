import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { fontStyle } from '@/shared/styles/fontStyle';

import { colorVars } from '@styles/tokens/color.css';

export const tapNavBar = style({
  display: 'flex',
  width: '37.5rem',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
});

export const tapButton = recipe({
  base: {
    display: 'flex',
    width: '18.8rem',
    flexDirection: 'column' as const,
    alignItems: 'flex-start' as const,
    flexShrink: 0,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    position: 'relative' as const,

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

export const tapButtonText = style({
  display: 'flex',
  height: '4.8rem',
  padding: '0 6rem',
  whiteSpace: 'nowrap',
  alignItems: 'center',
  gap: '1rem',
  alignSelf: 'stretch',
});
