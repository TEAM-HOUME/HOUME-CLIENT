import { style, keyframes } from '@vanilla-extract/css';

export const wrapper = style({
  position: 'relative',
  width: '100%',
  aspectRatio: '822 / 768', // 원본 프레임 비율
});

export const layer = style({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  pointerEvents: 'none', // 클릭 차단
  willChange: 'transform',
});

export const houseLayer = style([layer, { zIndex: 2 }]); // layer + zIndex 값

const float = keyframes({
  '0%': { transform: 'translateY(0)' }, // 시작 시점
  '50%': { transform: 'translateY(-12px)' }, // 중간 지점
  '100%': { transform: 'translateY(0)' }, // 끝 시점
});

// 왕복 애니메이션
export const floatLoop = style({
  animation: `${float} 3s ease-in-out infinite`,
});
