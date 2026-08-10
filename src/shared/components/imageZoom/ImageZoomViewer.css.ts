import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { colorVars } from '@styles/tokens/color.css';
import {
  popupFadeInInteraction,
  popupFadeInOpacityInteraction,
} from '@styles/tokens/interaction/presets';
import { unitVars } from '@styles/tokens/unit.css';
import { zIndex } from '@styles/tokens/zIndex';

const motionHidden = { opacity: 0 } as const;

// 앱의 모바일 프레임을 덮는 최상위 레이어 (Popup과 동일한 프레임 폭 규칙)
export const viewportLayer = style({
  position: 'fixed',
  zIndex: zIndex.popup,
  top: 0,
  bottom: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  width: '100%',
  minWidth: unitVars.unit.dimension.wMin,
  maxWidth: unitVars.unit.dimension.wMax,
  overflow: 'hidden',
  overscrollBehavior: 'none',
});

// 배경 오버레이 (닫기는 이미지 여백 탭에서 처리)
export const backdrop = recipe({
  base: {
    position: 'absolute',
    inset: 0,
    willChange: 'opacity',
    background: colorVars.color.gray999_a80,
  },
  variants: {
    motion: {
      opening: { ...motionHidden, transition: 'none' },
      open: { transition: popupFadeInOpacityInteraction, opacity: 1 },
    },
  },
  defaultVariants: { motion: 'opening' },
});

// 이미지/버튼 레이어 (프레임 전체) — 확대 뷰포트가 이 위에 얹힘
export const content = recipe({
  base: {
    position: 'absolute',
    inset: 0,
    willChange: 'opacity',
    outline: 'none',
  },
  variants: {
    motion: {
      opening: { ...motionHidden, transition: 'none' },
      open: { transition: popupFadeInInteraction, opacity: 1 },
    },
  },
  defaultVariants: { motion: 'opening' },
});

// react-zoom-pan-pinch 래퍼 (wrapperStyle로 프레임 전체 크기) — 드래그 커서
export const zoomWrapper = style({
  cursor: 'grab',
  ':active': { cursor: 'grabbing' },
});

// 확대 뷰포트 내부 스테이지(프레임 전체) — 이미지 중앙 정렬, 배경 여백 탭 = 닫기
export const imageStage = style({
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
});

export const image = recipe({
  base: {
    display: 'block',
    // generatedImg_imgArea와 동일: 화면 너비 꽉 채우고 같은 비율·크롭(cover, 26rem)으로
    objectFit: 'cover',
    objectPosition: 'center center',
    width: '100%',
    height: '26rem',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitTouchCallout: 'none',
  },
  variants: {
    mirrored: {
      true: { transform: 'scaleX(-1)' },
      false: { transform: 'none' },
    },
  },
  defaultVariants: { mirrored: false },
});
