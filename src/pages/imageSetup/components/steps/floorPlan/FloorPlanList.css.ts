import { style } from '@vanilla-extract/css';
import { animationTokens } from '@/shared/styles/tokens/animation.css';

export const wrapper = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
});

export const container = style({
  width: '100%',
  maxWidth: '44rem',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  padding: '2rem 2rem 4rem 2rem',
  animation: animationTokens.fadeInUpFast,
});

export const gridbox = style({
  width: '100%',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
  rowGap: '1.2rem',
  columnGap: '1.1rem',
  justifyContent: 'center',
});

export const buttonContainer = style({
  width: '100%',
  maxWidth: '44rem',
  marginBottom: '4rem',
});
