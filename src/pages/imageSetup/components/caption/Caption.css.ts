import { style } from '@vanilla-extract/css';

import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';

export const container = style({
  display: 'flex',
  padding: '0.8rem 1rem',
  borderRadius: '0.8rem',
  backgroundColor: colorVars.color.gray000,
  outline: `1px solid ${colorVars.color.gray300}`,
  outlineOffset: '-1px',
  gap: '0.4rem',
});

export const textBox = style({
  display: 'flex',
  gap: '0.2rem',
  alignItems: 'center',
});

export const text = style({
  ...fontStyle('caption_r_12'),
  color: colorVars.color.gray500,
});
