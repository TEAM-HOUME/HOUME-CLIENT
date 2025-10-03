import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

// import { zIndex } from '@/shared/styles/tokens/zIndex';
import { fontStyle } from '@/shared/styles/fontStyle';

import { colorVars } from '@styles/tokens/color.css';

export const container = style({
  width: '100%',
  aspectRatio: '3 / 2',
  overflow: 'hidden',
  position: 'relative',
});

export const imgArea = recipe({
  base: {
    width: '100%',
    aspectRatio: '3 / 2',
    objectFit: 'cover', // 비율 유지하며 영역 완전히 채움
    objectPosition: 'center', // 이미지 중앙 부분 표시
  },
  variants: {
    mirrored: {
      true: {
        transform: 'scaleX(-1)',
      },
      false: {
        transform: 'none',
      },
    },
  },
  defaultVariants: {
    mirrored: false,
  },
});

export const slideNum = style({
  position: 'absolute',
  right: '1.2rem',
  top: '1.2rem',
  bottom: '22.8rem',
  width: '3.4rem',
  height: '2rem',
  borderRadius: '99.9rem',
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: colorVars.color.gray000,
  backgroundColor: colorVars.color.gray999_30,
  ...fontStyle('caption_r_11'),
  gap: '0.1rem',
});

export const slidePrevBtn = style({
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  left: '1.2rem',
  bottom: '50%',
  width: '2.4rem',
  height: '2.4rem',
  backgroundColor: colorVars.color.gray999_30,
  borderRadius: '99.9rem',
  zIndex: 1,

  ':active': {
    backgroundColor: colorVars.color.gray999_50,
  },

  ':disabled': {
    backgroundColor: colorVars.color.gray000_30,
  },
});

export const slideNextBtn = style({
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  right: '1.2rem',
  bottom: '50%',
  width: '2.4rem',
  height: '2.4rem',
  backgroundColor: colorVars.color.gray999_30,
  borderRadius: '99.9rem',
  zIndex: 1,

  ':active': {
    backgroundColor: colorVars.color.gray999_50,
  },

  ':disabled': {
    backgroundColor: colorVars.color.gray000_30,
  },
});

export const tagBtn = style({
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  right: '1.2rem',
  bottom: '2.4rem',
  width: '2.8rem',
  height: '2.8rem',
  backgroundColor: colorVars.color.gray999_30,
  borderRadius: '99.9rem',
  zIndex: 1,

  ':active': {
    backgroundColor: colorVars.color.gray999_50,
  },
});
