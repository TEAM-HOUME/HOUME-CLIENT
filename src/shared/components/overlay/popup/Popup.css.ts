import { style } from '@vanilla-extract/css';
import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';
import { zIndex } from '@/shared/styles/tokens/zIndex';

export const backdrop = style({
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.08)',
  zIndex: zIndex.backdrop,
});

export const container = style({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: zIndex.popup,
  display: 'flex',
  flexDirection: 'column',
  width: '30rem',
  borderRadius: '20px',
  background: colorVars.color.gray000,
  border: 0,
});

export const info = style({
  display: 'flex',
  flexDirection: 'column',
  padding: '3.2rem 1.4rem',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '1.2rem',
  whiteSpace: 'pre-line',
  textAlign: 'center',
});

export const title = style({
  ...fontStyle('heading_sb_18'),
  color: colorVars.color.gray900,
});

export const detail = style({
  ...fontStyle('body_r_14'),
  color: colorVars.color.gray700,
});

export const buttonBox = style({
  display: 'flex',
  borderTop: `1px solid ${colorVars.color.gray200}`,
  textAlign: 'center',
});

export const exit = style({
  flex: 1,
  padding: '10px 0',
  ...fontStyle('body_r_14'),
  color: colorVars.color.gray700,
  borderRight: `1px solid ${colorVars.color.gray200}`,
});

export const cancel = style({
  flex: 1,
  padding: '10px 0',
  ...fontStyle('title_sb_16'),
  color: colorVars.color.primary,
});
