import { style } from '@vanilla-extract/css';

import { fontStyle } from '@/shared/styles/fontStyle';

export const container = style({
  display: 'flex',
  width: '100%',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 2rem',
});

export const profileBox = style({
  display: 'flex',
  alignItems: 'center',
  gap: '1.6rem',
});

export const profileImage = style({
  width: '4.8rem',
  height: '4.8rem',
  flexShrink: 0,
  borderRadius: '50%',
  backgroundSize: 'cover',
  backgroundPosition: '50%',
  backgroundRepeat: 'no-repeat',
  backgroundColor: 'lightgray',
});

export const userName = style({
  ...fontStyle('heading_sb_18'),
  whiteSpace: 'nowrap',
});
