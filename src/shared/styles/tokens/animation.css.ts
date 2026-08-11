import { keyframes } from '@vanilla-extract/css';

const fadeInUp = keyframes({
  '0%': {
    transform: 'translateY(20px)',
    opacity: 0,
  },
  '100%': {
    transform: 'translateY(0)',
    opacity: 1,
  },
});

// 애니메이션 토큰
export const animationTokens = {
  fadeInUp: `${fadeInUp} 0.8s ease-out forwards`,
  skeletonWave: keyframes({
    to: { backgroundPositionX: '-200%' },
  }),
} as const;

// 스켈레톤 로딩 그라데이션 (skeletonWave와 함께 사용)
export const SKELETON_GRADIENT =
  'linear-gradient(90deg, #ececec 8%, #f0f0f0 18%, #ececec 33%)';
