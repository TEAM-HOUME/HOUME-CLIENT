import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

export const container = style({
  position: 'relative',
  width: '100%',
  aspectRatio: '3 / 2',
  overflow: 'hidden',
});

export const image = recipe({
  base: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    transition: 'transform 0.2s ease-out',
  },
  variants: {
    mirrored: {
      true: {
        transform: 'scaleX(-1)',
      },
      false: {
        transform: 'none',
      },
    },
  },
  defaultVariants: {
    mirrored: false,
  },
});

export const overlay = recipe({
  base: {
    position: 'absolute',
    inset: 0,
    opacity: 0,
    pointerEvents: 'none',
    transition: 'opacity 0.24s ease-out',
  },
  variants: {
    visible: {
      true: {
        opacity: 1,
        pointerEvents: 'auto',
      },
      false: {
        opacity: 0,
        pointerEvents: 'none',
      },
    },
  },
  defaultVariants: {
    visible: false,
  },
});

export const hotspot = style({
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
  width: 24,
  height: 24,
  cursor: 'pointer',
});

export const debugLayer = style({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
});

export const debugBox = style({
  position: 'absolute',
  border: '1px solid rgba(255, 0, 0, 0.7)',
  boxSizing: 'border-box',
});

export const debugLabel = style({
  position: 'absolute',
  top: -16,
  left: 0,
  background: 'rgba(255, 0, 0, 0.7)',
  color: '#fff',
  fontSize: 10,
  padding: '0 4px',
  pointerEvents: 'none',
});
