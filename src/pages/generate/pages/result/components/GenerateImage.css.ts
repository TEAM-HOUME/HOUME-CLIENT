import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
// import { zIndex } from '@/shared/styles/tokens/zIndex';

export const container = style({
  width: '100%',
  aspectRatio: '3 / 2',
  overflow: 'hidden',
  border: '1px solid grey',
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
