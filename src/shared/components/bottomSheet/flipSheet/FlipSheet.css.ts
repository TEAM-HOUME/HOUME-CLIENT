import { styleVariants } from '@vanilla-extract/css';
import { style } from '@vanilla-extract/css';

import { fontStyle } from '@/shared/styles/fontStyle';

import { colorVars } from '@styles/tokens/color.css';

export const imageArea = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none', // 드래그 중 이미지 영역 클릭 방지
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
