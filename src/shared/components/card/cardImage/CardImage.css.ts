import { keyframes, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';
const shimmer = keyframes({
  '0%': { transform: 'translateX(-100%)' },
  '100%': { transform: 'translateX(100%)' },
});

export const cardcontainer = recipe({
  base: {
    width: '100%',
    minWidth: '16rem',
    maxWidth: '19.4rem',
    overflow: 'hidden',
    borderRadius: '1.6rem',
    outline: 'none',
    boxSizing: 'border-box',
    position: 'relative',
    cursor: 'pointer',
    selectors: {
      '&::after': {
        content: '',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        pointerEvents: 'none',
        borderRadius: '16px',
        transition: 'background-color 0.3s ease',
      },
    },
  },
  variants: {
    state: {
      default: { backgroundColor: colorVars.color.gray100 },
      pressed: {
        outline: 'none',
        selectors: {
          '&::after': {
            backgroundColor: 'rgba(0, 0, 0, 0.30)',
          },
        },
      },
      selected: {
        outline: `1.5px solid ${colorVars.color.primary}`,
        outlineOffset: '-1.5px',
        selectors: {
          '&::after': {
            backgroundColor: 'transparent',
          },
        },
      },
      disabled: {
        cursor: 'not-allowed',
        outline: 'none',
        selectors: {
          '&::after': {
            backgroundColor: 'transparent',
          },
        },
      },
    },
  },
  defaultVariants: {
    state: 'default',
  },
});

export const cardimg = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center',
  display: 'block',
  boxSizing: 'border-box',
});

export const disabledcardimg = style([
  cardimg,
  {
    opacity: 0.15,
  },
]);

export const checkbox = recipe({
  base: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    width: '2rem',
    height: '2rem',
    borderRadius: '9999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    ...fontStyle('body_m_14'),
    transition:
      'width 0.2s ease, height 0.2s ease, background-color 0.2s ease, color 0.2s ease',
  },
  variants: {
    state: {
      default: {
        backgroundColor: colorVars.color.gray000,
        border: 'none',
        color: 'transparent',
      },
      pressed: {
        backgroundColor: colorVars.color.gray000,
        border: 'none',
        color: 'transparent',
      },
      selected: {
        backgroundColor: colorVars.color.primary,
        border: 'none',
        color: colorVars.color.gray000,
        width: '2.4rem',
        height: '2.4rem',
      },
      disabled: {
        display: 'none',
      },
    },
  },
});

export const skeletonCardImg = style({
  width: '100%',
  height: '100%',
  borderRadius: '12px',
  backgroundColor: colorVars.color.gray100,
  position: 'relative',
  overflow: 'hidden',

  selectors: {
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      height: '100%',
      width: '60%',
      background:
        'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
      animation: `${shimmer} 1s infinite`,
    },
  },
});
