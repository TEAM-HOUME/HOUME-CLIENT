import { style } from '@vanilla-extract/css';

import { fontStyle } from '@/shared/styles/fontStyle';

import { colorVars } from '@styles/tokens/color.css';

export const messageWrapper = style({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  gap: '1rem',
  width: '100%',
  marginTop: '0.4rem',
});

export const messageText = style({
  ...fontStyle('caption_r_12'),
  color: colorVars.color.error,
  padding: '0.4rem 0',
  whiteSpace: 'pre-line', // 줄 바꿈
});
