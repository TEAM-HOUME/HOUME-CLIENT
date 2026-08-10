import { style } from '@vanilla-extract/css';

import { animationTokens } from '@styles/tokens/animation.css';

export const wrapper = style({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  height: '100%',
  animation: animationTokens.fadeInUpFast,
});

export const container = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
});

export const gridbox = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
  rowGap: '1.2rem',
  columnGap: '1.1rem',
  width: '100%',
  height: 'fit-content',
});
