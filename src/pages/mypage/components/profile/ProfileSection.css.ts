import { style } from '@vanilla-extract/css';
import { fontStyle } from '@/shared/styles/fontStyle';

export const container = style({
  display: 'flex',
  padding: '2.4rem 2rem',
  width: '100%',
});

export const profileBox = style({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '2.4rem',
  width: '100%',
});

export const iconWrapper = style({
  width: '11.2rem',
  height: '11.2rem',
  borderRadius: '999px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexShrink: 0,
  overflow: 'hidden',
});

export const creditWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  gap: '0.8rem',
  flex: 1,
  minWidth: 0,
  width: '100%',
});

export const textArea = style({
  display: 'flex',
  flexDirection: 'column',
  ...fontStyle('heading_sb_18'),
});
