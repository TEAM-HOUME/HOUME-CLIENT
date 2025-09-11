import { style } from '@vanilla-extract/css';

import { colorVars } from '@/shared/styles/tokens/color.css';

export const container = style({
  width: '100%',
  minWidth: '16rem',
  maxWidth: '19.4rem',
  height: '24rem',
  overflow: 'hidden',
  borderRadius: '16px',
  outline: 'none',
  boxSizing: 'border-box',
  position: 'relative',
  cursor: 'pointer',
  border: `1.5px solid ${colorVars.color.gray200}`,

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

    '&:active::after': {
      backgroundColor: 'rgba(0, 0, 0, 0.30)',
    },
  },
});

export const selected = style({
  selectors: {
    '&::after': {
      backgroundColor: 'rgba(0, 0, 0, 0.30)',
    },
  },
});

export const floorimg = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center',
  display: 'block',
  boxSizing: 'border-box',
});
