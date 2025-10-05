import { style } from '@vanilla-extract/css';

import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';
import { zIndex } from '@/shared/styles/tokens/zIndex';

export const container = style({
  display: 'flex',
  width: '100%',
  height: '4.8rem',
  justifyContent: 'space-between',
  alignItems: 'center',
  textAlign: 'center',
  position: 'relative',
  background: colorVars.color.gray000,
  color: colorVars.color.gray900,
});

export const leftdiv = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '4.8rem',
  height: '4.8rem',
  padding: '1.2rem',
});

export const backicon = style({
  cursor: 'pointer',
});

export const title = style({
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  margin: 0,
  zIndex: zIndex.base,
  width: 'max-content',
  pointerEvents: 'none',
  ...fontStyle('title_m_16'),
});

export const rightdiv = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '4.8rem',
  padding: '1.2rem 1.6rem',
  ...fontStyle('body_r_14'),
});
