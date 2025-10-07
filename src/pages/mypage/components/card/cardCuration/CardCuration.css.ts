import { style } from '@vanilla-extract/css';

export const cardCurationContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.6rem',
  width: '100%',
  overflow: 'visible',
});

export const cardImage = style({
  display: 'flex',
  width: '16.6rem',
  height: '16.6rem',
  justifyContent: 'center',
  alignItems: 'center',
  aspectRatio: '1/1',
  borderRadius: '0.8rem',
  overflow: 'hidden',
});

export const image = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});
