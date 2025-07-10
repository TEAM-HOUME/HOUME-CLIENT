import { style } from '@vanilla-extract/css';
import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';

export const container = style({
  display: 'flex',
  width: '100%',
  height: '4.8rem',
  paddingRight: '1.6rem',
  justifyContent: 'space-between',
  alignItems: 'center',
  textAlign: 'center',
  ...fontStyle('title_m_16'),
  color: colorVars.color.gray900,
});

export const leftdiv = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '4.8rem',
});

export const profileicon = style({
  width: '2.8rem',
  height: '2.8rem',
  cursor: 'pointer',
});

export const rightdiv = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '4.8rem',
  height: '4.8rem',
  padding: '1.2rem 0',
});
