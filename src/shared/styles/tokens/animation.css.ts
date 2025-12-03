import { keyframes } from '@vanilla-extract/css';

const fadeInUp = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translateY(20px)',
  },
  '100%': {
    opacity: 1,
    transform: 'translateY(0)',
  },
});

const slideLeft = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translateX(100%)',
  },
  '100%': {
    opacity: 1,
    transform: 'translateX(0)',
  },
});

// 애니메이션 토큰
export const animationTokens = {
  fadeInUpSlow: `${fadeInUp} 1.2s ease-out forwards`,
  fadeInUpFast: `${fadeInUp} 0.8s ease-out forwards`,
  slideLeft: `${slideLeft} 1.2s ease-out forwards`,
  shimmer: keyframes({
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' },
  }),
} as const;
