import { style } from '@vanilla-extract/css';

import {
  SKELETON_GRADIENT,
  animationTokens,
} from '@styles/tokensV2/animation.css';
import { colorVars } from '@styles/tokensV2/color.css';

// placeholder 모드에서 이미지가 로드되면 페이드인 (로딩 중엔 placeholder가 보임)
export const fadeImage = style({
  transition: 'opacity 0.3s ease-in-out',
});
export const fadeHidden = style({ opacity: 0 });
export const fadeVisible = style({ opacity: 1 });

const placeholderBase = style({
  position: 'absolute',
  inset: 0,
});

// shimmer 스켈레톤 (반짝이는 그라데이션)
export const skeletonPlaceholder = style([
  placeholderBase,
  {
    background: SKELETON_GRADIENT,
    backgroundSize: '200% 100%',
    animation: `${animationTokens.skeletonWave} 2s linear infinite`,
  },
]);

// 단색 중립 배경 (shimmer 없이 깜빡임만 최소화)
export const colorPlaceholder = style([
  placeholderBase,
  {
    backgroundColor: colorVars.color.gray200,
  },
]);
