import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { colorVars } from '@styles/tokens/color.css';

export const container = style({
  display: 'flex',
  width: '31.5rem',
  padding: '1.6rem 2rem 1.2rem 2rem',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.8rem',
  borderRadius: '1.6rem',
  background: colorVars.color.gray000,
});

export const wrapper = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '1rem',
});

export const backgroundBar = style({
  width: '20rem',
  height: '0.4rem',
  flexShrink: 0,
  borderRadius: '99.9rem',
  background: colorVars.color.gray200,
  position: 'relative',
});

export const fillVariants = recipe({
  base: {
    height: '0.4rem',
    borderRadius: '99.9rem',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  variants: {
    variant: {
      start: {
        width: '0.4rem',
        flex: '1 0 0',
        background: colorVars.color.primary,
      },
      loading: {
        width: '7.4rem',
        flex: '1 0 0',
        background: colorVars.color.primary,
      },
      complete: {
        width: '20rem',
        background: colorVars.color.primary,
      },
    },
  },
  defaultVariants: {
    variant: 'start',
  },
});

export const textWrapper = style({
  fontSize: '1.4rem',
  color: colorVars.color.gray600,
});
