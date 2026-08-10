import { keyframes, style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { zIndex } from '@styles/tokens/zIndex';

import { fontStyle } from '@/shared/styles/fontStyle';

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

export const backdrop = style({
  position: 'fixed',
  zIndex: zIndex.backdrop,
  inset: 0,
  // 딤 0.2는 공식 토큰에 없는 값 — Popup.css.ts의 동일 리터럴과 함께 색상 토큰화 차수에서 디자인 확인 후 정리
  background: 'rgba(0, 0, 0, 0.2)',
  animation: `${fadeIn} 0.45s cubic-bezier(0.22, 1, 0.36, 1)`,
});

export const container = style({
  position: 'fixed',
  zIndex: zIndex.modal,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  willChange: 'opacity',
  borderRadius: '20px',
  backgroundColor: colorVars.color.gray000,
  width: '30rem',
  animation: `${fadeIn} 0.45s cubic-bezier(0.22, 1, 0.36, 1)`,
});

export const contentArea = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '3.2rem 1.4rem',
});

export const headingText = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1.2rem',
  textAlign: 'center',
});

export const title = style({
  ...fontStyle('title_sb_16'),
  color: colorVars.color.gray900,
});

export const body = style({
  ...fontStyle('body_r_14'),
  whiteSpace: 'pre-line',
  color: colorVars.color.gray700,
});

export const buttonArea = style({
  borderTop: `1px solid ${colorVars.color.gray200}`,
});

export const closeButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '4.8rem',
  ...fontStyle('body_r_14'),
  color: colorVars.color.gray700,
});
