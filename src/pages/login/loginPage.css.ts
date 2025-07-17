import { style } from '@vanilla-extract/css';
import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';

export const container = style({
  background: colorVars.color.bg_grad,
});

export const textbox = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '0.8rem',
  width: '100%',
  textAlign: 'center',
  ...fontStyle('title_m_16'),
  padding: '4rem 2rem 2rem 2rem',
});

export const title = style({
  ...fontStyle('heading_sb_20'),
  color: colorVars.color.gray900,
});

export const content = style({
  ...fontStyle('body_r_14'),
  color: colorVars.color.gray600,
});

export const imgbox = style({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
});

export const loginImg = style({
  width: '37.5rem',
  height: '34.4rem',
});

export const btnarea = style({
  position: 'fixed',
  bottom: '0',
  width: '100%',
  maxWidth: '430px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '1rem',
  padding: '0 2rem 2rem 2rem',
});

export const aside = style({
  ...fontStyle('caption_r_12'),
  color: colorVars.color.gray500,
});

export const link = style({
  textDecoration: 'underline',
  textUnderlineOffset: '2px',
});
