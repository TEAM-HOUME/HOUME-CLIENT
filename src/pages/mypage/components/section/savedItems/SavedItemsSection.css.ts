import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  width: '100%',
  padding: '0 2rem',
  marginTop: '2rem',
  justifyContent: 'center',
});

export const gridContainer = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 10.8rem)',
  columnGap: '0.55rem',
  rowGap: '0',
});
