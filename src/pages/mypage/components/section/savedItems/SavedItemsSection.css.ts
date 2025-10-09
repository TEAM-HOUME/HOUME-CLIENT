import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  width: '100%',
  padding: '0 2rem',
  marginTop: '2rem',
  justifyContent: 'center',
  boxSizing: 'border-box',
});

export const gridContainer = style({
  display: 'grid',
  width: '100%',
  gridTemplateColumns: 'repeat(3, 1fr)',
  columnGap: '0.55rem',
  rowGap: '0',
});
