import { style } from '@vanilla-extract/css';

import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.6rem',
  textAlign: 'left',
});

export const title = style({
  ...fontStyle('title_sb_16'),
  color: colorVars.color.gray800,
});

export const subtitle = style({
  ...fontStyle('caption_r_12'),
  color: colorVars.color.gray500,
});
