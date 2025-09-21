import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';

export const container = recipe({
  base: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  variants: {
    hasBorder: {
      true: {
        border: `1px solid ${colorVars.color.gray100}`,
        borderRadius: '8px',
        padding: '1rem',
      },
    },
  },
});

export const title = recipe({
  variants: {
    titleSize: {
      small: {
        textAlign: 'start',
        ...fontStyle('body_m_14'),
        color: colorVars.color.gray700,
        marginBottom: '1rem',
      },
      large: {
        textAlign: 'start',
        ...fontStyle('title_sb_16'),
        color: colorVars.color.gray800,
        marginBottom: '1.6rem',
      },
    },
  },
});

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

export const errorContainer = style({
  marginTop: '4px',
});
