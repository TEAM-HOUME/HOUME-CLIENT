import { style } from '@vanilla-extract/css';

import { fontStyle } from '@/shared/styles/fontStyle';

export const container = style({
  display: 'flex',
  width: '100%',
  maxWidth: '100%',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 2rem',
  boxSizing: 'border-box',
});

export const profileBox = style({
  display: 'flex',
  alignItems: 'center',
  gap: '1.6rem',
  flex: '0 1 auto',
});

export const profileImage = style({
  width: '4.8rem',
  height: '4.8rem',
  justifyContent: 'center',
  alignItems: 'center',
  aspectRatio: '1/1',
  borderRadius: '50%',
  flexShrink: 0,
});

export const userName = style({
  ...fontStyle('heading_sb_18'),
  whiteSpace: 'nowrap',
  flex: '0 0 auto',
});
