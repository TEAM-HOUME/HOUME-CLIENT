import { style } from '@vanilla-extract/css';

import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';

export const container = style({
  display: 'inline-flex',
  gap: '1rem',
  padding: '1rem 2rem',
  borderRadius: '30px',
  background: colorVars.color.gray900,
});

export const text = style({
  ...fontStyle('body_m_14'),
  color: colorVars.color.gray000,
});
