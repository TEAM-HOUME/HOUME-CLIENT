import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { animationTokens } from '@/shared/styles/tokens/animation.css';

import { zIndex } from '@shared/styles/tokens/zIndex';

export const container = style({
  position: 'relative',
  width: '100%',
  minHeight: '26rem',
  aspectRatio: '3 / 2',
  overflow: 'hidden',
});

export const image = recipe({
  base: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    transition: 'transform 0.2s ease-out, opacity 0.3s ease-in-out',
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
    loaded: {
      true: { opacity: 1 },
      false: { opacity: 0 },
    },
  },
  defaultVariants: {
    mirrored: false,
    loaded: false,
  },
});

export const overlay = recipe({
  base: {
    position: 'absolute',
    inset: 0,
    opacity: 0,
    pointerEvents: 'none',
    transition: 'opacity 0.24s ease-out',
    // 오버레이 레이어 우선순위 명시
    zIndex: zIndex.base,
  },
  variants: {
    visible: {
      true: {
        opacity: 1,
        pointerEvents: 'auto',
      },
      false: {
        opacity: 0,
        pointerEvents: 'none',
      },
    },
  },
  defaultVariants: {
    visible: false,
  },
});

export const hotspot = style({
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
  // 핫스팟 버튼 크기를 px 단위로 고정
  width: '24px',
  height: '24px',
  cursor: 'pointer',
});

export const skeleton = style({
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(90deg, #ececec 8%, #f0f0f0 18%, #ececec 33%)',
  backgroundSize: '200% 100%',
  zIndex: zIndex.base,
  animation: `${animationTokens.skeletonWave} 2s linear infinite`,
});
