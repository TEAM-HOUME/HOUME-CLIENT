import { style } from '@vanilla-extract/css';

export const container = style({
  width: '100%',
  padding: '0 2rem',
  marginTop: '2rem',
});

export const gridContainer = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 16.4rem)',
  gap: '0.7rem',
  rowGap: '1.6rem',
  width: '100%',
});
