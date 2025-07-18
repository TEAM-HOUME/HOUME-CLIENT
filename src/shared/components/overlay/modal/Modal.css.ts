import { style } from '@vanilla-extract/css';
import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';
import { zIndex } from '@/shared/styles/tokens/zIndex';

export const backdrop = style({
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.2)',
  zIndex: zIndex.backdrop,
});

export const container = style({
  backgroundColor: colorVars.color.gray000,
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: zIndex.modal,
  display: 'flex',
  flexDirection: 'column',
  width: '30rem',
  height: '42.6rem',
  padding: '3.2rem 0 1.6rem 0',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '3.2rem',
  borderRadius: '2rem',
  border: 0,
});

export const info = style({
  display: 'flex',
  width: '22.8rem',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '1.6rem',
  whiteSpace: 'pre-line', // 문자열에 개행(\n)이 있을 때만 줄바꿈함
});

export const title = style({
  textAlign: 'center',
  ...fontStyle('heading_sb_18'),
  color: colorVars.color.gray900,
  // wordBreak: 'keep-all', // 공백 또는 하이픈에서만 줄바꿈이 일어나도록 설정
});

export const creditBox = style({
  display: 'flex',
  width: '11.5rem',
  height: '3.6rem',
  padding: '0 1.6rem',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: '6px',
  background: colorVars.color.gray100,
});

export const label = style({
  ...fontStyle('body_m_14'),
  color: colorVars.color.gray600,
});

export const count = style({
  ...fontStyle('title_sb_16'),
  color: colorVars.color.primary,
});

export const creditImg = style({
  width: '22.8rem',
  height: '12rem',
  background: colorVars.color.gray100,
});

export const buttonBox = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.4rem',
  width: '18rem',
});

export const exitButton = style({
  display: 'flex',
  width: '4.8rem',
  height: '4.8rem',
  justifyContent: 'center',
  alignItems: 'center',
});

export const exitButtonText = style({
  ...fontStyle('body_r_14'),
  color: colorVars.color.gray500,
});
