import { style } from '@vanilla-extract/css';

import { animationTokens } from '@/shared/styles/tokens/animation.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

export const contents = style({
  display: 'flex',
  flexDirection: 'column',
  padding: '2rem',
  gap: '4rem',
  animation: animationTokens.fadeInUpFast,
});

export const activityButton = style({
  marginTop: '1.6rem',
});

export const caption = style({
  marginTop: '1.4rem',
});
