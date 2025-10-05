import { style, styleVariants } from '@vanilla-extract/css';

import { fontStyle } from '@/shared/styles/fontStyle';

import { colorVars } from '@styles/tokens/color.css';

export const container = style({
  display: 'inline-flex',
  padding: '0.6rem 0.8rem',
  borderRadius: '999px',
  alignItems: 'center',
  backgroundColor: colorVars.color.gray100,
});

export const image = style({
  margin: '0.4rem',
});

export const textWrapper = style({
  display: 'flex',
  gap: '0.1rem',
  padding: '0.4rem',
});

export const text = styleVariants({
  primary: {
    ...fontStyle('title_m_16'),
    color: colorVars.color.primary,
  },
  default: {
    ...fontStyle('title_m_16'),
    color: colorVars.color.gray500,
  },
});
