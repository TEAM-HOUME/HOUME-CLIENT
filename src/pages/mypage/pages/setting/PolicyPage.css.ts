import { style } from '@vanilla-extract/css';

import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';

export const container = style({
  width: '100%',
  minHeight: '100vh',
});

export const content = style({
  padding: '1.2rem 2rem',
});

export const dateText = style({
  ...fontStyle('caption_r_12'),
  color: colorVars.color.gray600,
  textAlign: 'right',
  marginBottom: '1.2rem',
});

export const policyText = style({
  ...fontStyle('caption_r_12'),
  color: colorVars.color.gray600,
  lineHeight: '1.8',
  whiteSpace: 'pre-wrap',
  wordBreak: 'keep-all',
});
