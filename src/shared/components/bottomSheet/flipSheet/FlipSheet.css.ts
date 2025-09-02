import { styleVariants } from '@vanilla-extract/css';
import { style } from '@vanilla-extract/css';

import { fontStyle } from '@/shared/styles/fontStyle';
import { zIndex } from '@/shared/styles/tokens/zIndex';

import { colorVars } from '@styles/tokens/color.css';

export const backdrop = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: zIndex.backdrop,
  opacity: 0,
  visibility: 'hidden',
  touchAction: 'none',
  pointerEvents: 'none',
  transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out',
});

export const backdropVisible = style({
  opacity: 1,
  visibility: 'visible',
  pointerEvents: 'auto',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
});

export const sheetWrapper = style({
  position: 'fixed',
  bottom: 0,
  left: '50%',
  width: '100%',
  maxWidth: '44rem',
  padding: '0rem 2.4rem 2rem 2.4rem',
  backgroundColor: colorVars.color.gray000,
  borderRadius: '30px 30px 0 0',
  zIndex: zIndex.sheet,
  overflow: 'hidden',
  userSelect: 'none',
  cursor: 'grab',

  // 드래그 중일 때만 transition 비활성화
  selectors: {
    '&:active': {
      cursor: 'grabbing',
    },
  },
});

export const sheetWrapperExpanded = style({
  transform: 'translate(-50%, 0)',
  transition: 'transform 0.6s ease-in-out',
});

export const sheetWrapperCollapsed = style({
  transform: 'translate(-50%, 100%)',
  transition: 'transform 0.6s ease-in-out',
});

export const imageArea = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none', // 드래그 중 이미지 영역 클릭 방지
});

export const dragHandleContainer = style({
  display: 'flex',
  height: '2.8rem',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'auto', // 드래그 핸들은 클릭 가능하게
});

export const infoText = style({
  ...fontStyle('heading_sb_18'),
  color: colorVars.color.gray900,
});

export const imageContainer = style({
  width: '22rem',
  height: '33rem',
  borderRadius: '16px',
  overflow: 'hidden',
});

export const imageVariants = styleVariants({
  normal: {
    width: '100%',
    height: '100%',
    transition: 'transform 0.3s ease-in-out',
    transform: 'none',
    pointerEvents: 'none',
    userSelect: 'none',
  },
  flipped: {
    width: '100%',
    height: '100%',
    transition: 'transform 0.3s ease-in-out',
    transform: 'scaleX(-1)',
    pointerEvents: 'none',
    userSelect: 'none',
  },
});

export const buttonGroup = style({
  display: 'flex',
  gap: '1.2rem',
  marginTop: '3.2rem',
  pointerEvents: 'auto', // 버튼 클릭 가능
});
