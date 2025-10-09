import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';
import { zIndex } from '@/shared/styles/tokens/zIndex';

export const wrapper = recipe({
  base: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  variants: {
    size: {
      large: { minWidth: '16.6rem' },
      small: { minWidth: '10.8rem' },
    },
  },
});

export const imgSection = recipe({
  base: {
    position: 'relative', // 내부 absolute(링크 버튼)의 기준
    overflow: 'hidden', // 모서리 밖으로 이미지 안 튀어나오게
    borderRadius: '12px',
    border: `1px solid ${colorVars.color.gray200}`,
    width: '100%',
    aspectRatio: '1 / 1', // 이미지 영역만 정사각형
    background: 'transparent',
  },
  variants: {
    size: {
      large: {},
      small: {},
    },
  },
});

export const cardImage = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center',
  display: 'block',
  boxSizing: 'border-box',
});

export const linkBtnContainer = style({
  position: 'absolute',
  zIndex: zIndex.button,
  left: '0.8rem',
  bottom: '0.8rem',
});

export const bottomSection = style({
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0.6rem 0 2rem 0',
  width: '100%',
  gap: '0.4rem',
});

export const textContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.6rem',
  minWidth: '8rem',
  padding: '0.2rem',
  width: '100%',
  flex: '1 1 auto', // 남은 공간 텍스트가 차기
});

export const saveBtnContainer = style({
  flex: '0 0 auto', // 하트 아이콘 찌그러짐 방지
});

export const productText = style({
  ...fontStyle('body_r_13'),
  color: colorVars.color.gray999,
  maxHeight: '3.6rem',

  display: '-webkit-box',
  WebkitLineClamp: 2, // 최대 2줄
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

export const brandText = style({
  ...fontStyle('caption_r_11'),
  color: colorVars.color.gray700,
});
