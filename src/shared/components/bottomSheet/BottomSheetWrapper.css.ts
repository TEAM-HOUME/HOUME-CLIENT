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
  width: '100%',
  maxWidth: '50rem',
  zIndex: zIndex.sheet,

  willChange: 'transform',
  transform: 'translate(-50%, calc(var(--base-y) + var(--drag-y)))',
  transition: 'transform 0.3s ease-in-out',

  vars: {
    '--base-y': '100%',
    '--drag-y': '0px',
  },

  userSelect: 'none',
  // touchAction: 'none', // Pull-to-refresh 방지
  overscrollBehavior: 'none', // overscroll 방지
  WebkitOverflowScrolling: 'touch', // iOS에서 부드러운 스크롤
  WebkitUserSelect: 'none', // Safari에서 텍스트 선택 방지
  WebkitTouchCallout: 'none', // iOS에서 터치 콜아웃 방지

  // 드래그 중일 때만 transition 비활성화
  selectors: {
    '&:active': {
      cursor: 'grabbing',
    },
  },
});

export const sheetState = styleVariants({
  expanded: {
    vars: {
      '--base-y': '0%',
    },
  },
  collapsed: {
    vars: {
      '--base-y': '100%',
    },
  },
});

export const contentWrapper = recipe({
  base: {
    minHeight: '30rem',
    backgroundColor: colorVars.color.gray000,
    overflow: 'hidden',
  },
  variants: {
    type: {
      basic: {
        padding: '0 2rem 2rem 2rem',
        borderRadius: '30px 30px 0 0',
      },
      curation: {
        padding: '0 1.6rem',
        borderRadius: '12px 12px 0 0',
        boxShadow: '0 -10px 14px 0 rgba(209, 213, 219, 0.10)',
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
