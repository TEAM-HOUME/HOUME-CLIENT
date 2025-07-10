import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

export const stepsWrapper = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const step = style({
  width: '19.4rem',
  height: '2rem',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const icon = recipe({
  base: {
    width: '100%',
    height: '100%',
    display: 'block',
  },
  variants: {
    variant: {
      active: {
        opacity: 1,
      },
      inactive: {
        opacity: 0.3,
      },
    },
  },
  defaultVariants: {
    variant: 'inactive',
  },
});
