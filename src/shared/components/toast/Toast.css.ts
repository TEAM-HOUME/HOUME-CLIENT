import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';

export const container = style({
  display: 'inline-flex',
  gap: '1.5rem',
  padding: '1rem 2rem',
  borderRadius: '30px',
  background: colorVars.color.gray900,
});

export const text = recipe({
  base: {
    ...fontStyle('body_m_14'),
    color: colorVars.color.gray000,
  },
  variants: {
    type: {
      navigate: {
        color: colorVars.color.gray300,
      },
    },
  },
});

export const action = style({
  ...fontStyle('body_m_14'),
  textDecoration: 'underline',
  color: colorVars.color.gray000,
});
