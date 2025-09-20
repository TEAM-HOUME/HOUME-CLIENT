import { recipe } from '@vanilla-extract/recipes';

export const buttonGroupStyles = recipe({
  base: {
    display: 'grid',
    gap: '0.7rem',
  },
  variants: {
    layout: {
      'grid-2': {
        gridTemplateColumns: 'repeat(2, 1fr)',
      },
      'grid-3': {
        gridTemplateColumns: 'repeat(3, 1fr)',
      },
      'grid-4': {
        gridTemplateColumns: 'repeat(4, 1fr)',
      },
    },
  },
  defaultVariants: {
    layout: 'grid-2',
  },
});
