import { style } from '@vanilla-extract/css';

import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1.6rem',
  padding: '2.4rem 2rem',
  width: '100%',
  backgroundColor: colorVars.color.gray100,
});

export const title = style({
  ...fontStyle('title_sb_16'),
  color: colorVars.color.gray800,
  alignSelf: 'flex-start',
});
