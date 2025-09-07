import { style, styleVariants } from '@vanilla-extract/css';
import { zIndex } from '@/shared/styles/tokens/zIndex';
import { colorVars } from '@/shared/styles/tokens/color.css';

export const backdrop = style({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: colorVars.color.gray999_50,
  opacity: 0,
  visibility: 'hidden',
  transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out',
  zIndex: zIndex.backdrop,
  touchAction: 'none',
  pointerEvents: 'none',
});

export const backdropVisible = style({
  opacity: 1,
  visibility: 'visible',
  pointerEvents: 'auto',
});

export const sheetWrapper = style({
  position: 'fixed',
  bottom: 0,
  left: '50%',
  transform: 'translate(-50%, 100%)', // 초기 위치
  width: '100%',
  maxWidth: '50rem',
  backgroundColor: colorVars.color.gray000,
  borderTopLeftRadius: '20px',
  borderTopRightRadius: '20px',
  zIndex: zIndex.sheet,
});

export const sheetState = styleVariants({
  expanded: { transform: 'translate(-50%, 0)' }, // 확장된 상태
  collapsed: { transform: 'translate(-50%, 100%)' }, // 접힌 상태
});

export const contentWrapper = style({
  padding: '2rem',
  minHeight: '30rem',
});

export const dragHandleContainer = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: '2.4rem',
  marginBottom: '2rem',
  touchAction: 'none',
  userSelect: 'none',
});
