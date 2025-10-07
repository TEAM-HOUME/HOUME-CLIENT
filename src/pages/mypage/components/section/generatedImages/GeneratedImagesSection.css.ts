import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  padding: '2rem 2rem 4rem 2rem',
  alignItems: 'center',
  gap: '1rem',
});

export const gridContainer = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 16.4rem)',
  columnGap: '0.7rem',
  rowGap: '1.6rem',

  '@media': {
    'screen and (max-width: 768px)': {
      gridTemplateColumns: 'repeat(2, 16.4rem)',
    },
    'screen and (max-width: 480px)': {
      gridTemplateColumns: 'repeat(1, 16.4rem)',
    },
  },
});
