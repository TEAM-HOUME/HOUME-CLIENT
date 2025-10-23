import { style } from '@vanilla-extract/css';

export const container = style({
  position: 'relative',
  width: '100%',
  aspectRatio: '3 / 2',
  overflow: 'hidden',
});

export const image = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center',
});

export const overlay = style({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'auto',
});

export const hotspot = style({
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
  width: 24,
  height: 24,
  cursor: 'pointer',
});
