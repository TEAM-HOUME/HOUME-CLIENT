import { style } from '@vanilla-extract/css';
import { animationTokens } from '@/shared/styles/tokens/animation.css';

export const wrapper = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  animation: animationTokens.fadeInUpFast,
});

export const container = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '2rem',
});

export const gridbox = style({
  width: '100%',
  height: 'fit-content',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
  rowGap: '1.2rem',
  columnGap: '1.1rem',
});
