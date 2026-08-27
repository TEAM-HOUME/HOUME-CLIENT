// [임시 파일] CompareFallback과 함께 교체
import { style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1.2rem',
  padding: '8rem 2rem',
  textAlign: 'center',
});

export const title = style({
  ...fontVars.font.title_sb_16,
  color: colorVars.color.gray900,
});

export const description = style({
  ...fontVars.font.body_r_14,
  color: colorVars.color.gray500,
});
