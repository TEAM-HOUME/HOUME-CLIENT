import { style, styleVariants } from '@vanilla-extract/css';

import { layoutVars } from '@/shared/styles/global.css';
import { zIndex } from '@/shared/styles/tokens/zIndex';

import { CURATION_PEEK_HEIGHT } from '@constants/bottomSheet';

export const sheetWrapper = style({
  position: 'fixed',
  bottom: 0,
  left: '50%',
  width: '100%',
  maxWidth: layoutVars.maxWidth,

  zIndex: zIndex.sheet,

  willChange: 'transform',
  // clamp(최소 상단, 현재 이동값, 최대 하단)
  transform:
    'translate(-50%, clamp(0px, calc(var(--base-y) + var(--drag-y)), 100%))',
  transition: 'transform 300ms ease-in-out',

  vars: {
    '--base-y': `calc(100% - ${CURATION_PEEK_HEIGHT})`, // 상태에 따른 목표
    '--drag-y': '0px', // 드래그 변화량
  },

  userSelect: 'none',
  touchAction: 'none',
  overscrollBehavior: 'none',
  WebkitOverflowScrolling: 'touch',

  display: 'flex',
  flexDirection: 'column',
});

export const snapStyles = styleVariants({
  collapsed: {
    vars: {
      '--base-y': `calc(100% - ${CURATION_PEEK_HEIGHT})`,
    },
  },
  mid: {
    vars: {
      '--base-y': 'calc(100% - 37rem)',
    },
  },
  expanded: {
    vars: { '--base-y': '0px' },
  },
});
