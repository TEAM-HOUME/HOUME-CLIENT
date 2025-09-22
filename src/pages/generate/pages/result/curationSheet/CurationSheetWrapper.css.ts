import { style, styleVariants } from '@vanilla-extract/css';

import { layoutVars } from '@/shared/styles/global.css';
import { zIndex } from '@/shared/styles/tokens/zIndex';

import { CURATION_PEEK_HEIGHT } from './CurationSheetWrapper';

export const sheetWrapper = style({
  position: 'fixed',
  bottom: 0,
  left: '50%',
  width: '100%',
  maxWidth: layoutVars.maxWidth,

  zIndex: zIndex.sheet,

  transform: 'translate(-50%, calc(var(--base-y) + var(--drag-y)))',
  transition: 'transform 300ms ease-in-out',

  vars: {
    '--base-y': `calc(100% - ${CURATION_PEEK_HEIGHT})`, // 상태에 따른 목표
    '--drag-y': '0px', // 드래그 변화량은 0에서 시작
  },

  display: 'flex',
  flexDirection: 'column',
  willChange: 'transform',
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
    vars: {
      '--base-y': '0px',
    },
  },
});
