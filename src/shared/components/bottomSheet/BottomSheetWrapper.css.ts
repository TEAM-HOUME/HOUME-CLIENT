import { style, styleVariants } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { colorVars } from '@/shared/styles/tokens/color.css';
import { zIndex } from '@/shared/styles/tokens/zIndex';

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

export const contentWrapper = recipe({
  base: {
    minHeight: '30rem',
  },
  variants: {
    type: {
      basic: {
        padding: '0 2rem 2rem 2rem',
      },
      curation: {
        padding: '0 1.6rem',
      },
    },
  },
});

export const dragHandleContainer = recipe({
  base: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '2.8rem',
    touchAction: 'none',
    userSelect: 'none',
  },
  variants: {
    type: {
      basic: {
        marginBottom: '2rem',
      },
      curation: {
        marginBottom: '0',
      },
    },
  },
});
