import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { animationTokens } from '@/shared/styles/tokens/animation.css';
import { colorVars } from '@/shared/styles/tokens/color.css';

export const cardCurationContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.6rem',
  width: '100%',
  overflow: 'visible',
});

export const cardImage = style({
  display: 'flex',
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  aspectRatio: '1/1',
  borderRadius: '0.8rem',
  overflow: 'hidden',
  cursor: 'pointer',
  position: 'relative',
});

export const image = recipe({
  base: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'opacity 0.3s ease-in-out', // 이미지 로드 완료 시 이미지로 부드럽게 전환
  },
  variants: {
    loaded: {
      true: { opacity: 1 },
      false: { opacity: 0 }, // 로드 중에는 이미지 투명하게
    },
  },
  defaultVariants: {
    loaded: false,
  },
});

export const skeleton = style({
  position: 'absolute',
  inset: 0, // 부모 영역 전체 덮음
  borderRadius: '0.8rem',
  backgroundColor: colorVars.color.gray100,
  overflow: 'hidden',

  selectors: {
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      height: '100%',
      width: '60%',
      background:
        'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
      animation: `${animationTokens.shimmer} 1.2s infinite`,
    },
  },
});
