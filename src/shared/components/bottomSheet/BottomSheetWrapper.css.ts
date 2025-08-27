import { style } from '@vanilla-extract/css';
import { zIndex } from '@/shared/styles/tokens/zIndex';
import { colorVars } from '@/shared/styles/tokens/color.css';

export const backdrop = style({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  opacity: 0,
  visibility: 'hidden',
  transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out',
  zIndex: zIndex.backdrop,
});

export const backdropVisible = style({
  opacity: 1,
  visibility: 'visible',
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
  transition: 'transform 0.3s ease-in-out',
  zIndex: zIndex.sheet,
});

// 확장된 상태
export const sheetWrapperExpanded = style({
  transform: 'translate(-50%, 0)',
});

// 접힌 상태
export const sheetWrapperCollapsed = style({
  transform: 'translate(-50%, 100%)',
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
});
