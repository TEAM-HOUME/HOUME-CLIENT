import { style } from '@vanilla-extract/css';
import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: '2.4rem',
  padding: '1.6rem 2rem 0 2rem',
  justifyContent: 'center',
  alignItems: 'center',
});

export const title = style({
  width: '100%',
  ...fontStyle('heading_sb_20'),
  color: colorVars.color.gray900,
});

export const fieldbox = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: '1.2rem',
  justifyContent: 'center',
  alignItems: 'center',
});

export const fieldtitle = style({
  width: '100%',
  ...fontStyle('title_sb_16'),
  color: colorVars.color.gray800,
});

export const flexbox = style({
  display: 'flex',
  width: '100%',
  gap: '0.7rem',
  justifyContent: 'center',
  alignItems: 'center',
});

export const btnarea = style({
  position: 'fixed',
  bottom: 0,
  width: '100%',
  maxWidth: '440px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '0 2rem 2rem 2rem',
});
