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

  willChange: 'transform',
  // clamp(최소 상단, 현재 이동값, 최대 하단)
  transform:
    'translate(-50%, clamp(var(--min-top), calc(var(--base-y) + var(--drag-y)), 100%))',
  transition: 'transform 300ms ease-in-out',

  vars: {
    '--base-y': `calc(100% - ${CURATION_PEEK_HEIGHT})`, // 상태에 따른 목표
    '--drag-y': '0px', // 드래그 변화량
    '--sheet-max-h': '60rem', // 시트 최대 높이

    // 뷰포트에서 시트를 최대 높이(60rem)까지 올렸을 때
    // 시트 상단이 화면 위에서 떨어져 있어야 하는 최소 translateY 거리
    '--min-top': 'max(0px, calc(100vh - var(--sheet-max-h)))',
  },

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
    vars: {
      '--base-y': '0px',
    },
  },
});
