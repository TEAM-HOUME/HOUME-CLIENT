import { keyframes, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';
import { zIndex } from '@/shared/styles/tokens/zIndex';

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

export const backdrop = style({
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.2)',
  zIndex: zIndex.backdrop,
  animation: `${fadeIn} 0.45s cubic-bezier(0.22, 1, 0.36, 1)`,
});

export const container = style({
  backgroundColor: colorVars.color.gray000,
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: zIndex.modal,
  width: '30rem',
  animation: `${fadeIn} 0.45s cubic-bezier(0.22, 1, 0.36, 1)`,
  willChange: 'opacity',
  borderRadius: '20px',
});

export const contentArea = style({
  display: 'flex',
  flexDirection: 'column',
  padding: '3.2rem 1.4rem',
  gap: '1.6rem',
  alignItems: 'center',
  borderBottom: `1px solid ${colorVars.color.gray200}`,
});

export const textBox = style({
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'center',
  gap: '1.2rem',
});

export const title = style({
  ...fontStyle('title_sb_16'),
  color: colorVars.color.gray900,
});

export const body = style({
  ...fontStyle('body_r_14'),
  color: colorVars.color.gray600,
  whiteSpace: 'pre-line', // 문자열에 개행(\n)이 있을 때만 줄바꿈함
});

export const buttonArea = style({
  display: 'flex',
});

export const button = recipe({
  base: {
    flex: '1 1 0', // flex-grow: 1, flex-shrink: 1, flex-basis: 0, 버튼 간 동일 가로너비 보장
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1.2rem 0',
    selectors: {
      // 버튼 사이 border 제공
      '&:not(:first-child)': {
        borderLeft: `1px solid ${colorVars.color.gray200}`,
      },
    },
  },
  variants: {
    variant: {
      primary: {
        ...fontStyle('body_m_14'),
        color: colorVars.color.primary,
      },
      default: {
        ...fontStyle('body_r_14'),
        color: colorVars.color.gray600,
      },
    },
  },
});
