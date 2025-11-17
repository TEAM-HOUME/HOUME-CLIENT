import { style } from '@vanilla-extract/css';

import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  textAlign: 'left',
  ...fontStyle('title_m_16'),
});

export const title = style({
  ...fontStyle('heading_sb_20'),
  color: colorVars.color.gray900,
});

export const content = style({
  ...fontStyle('body_r_14'),
  color: colorVars.color.gray700,
});
