import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { pressInteraction } from '@styles/tokens/interaction/presets';
import { unitVars } from '@styles/tokens/unit.css';

// 카드 컨테이너
// - default: 1px secondary 테두리, 둥근 사각형
// - selected: 1.5px strong 테두리
// - disabled: opacity 0.5
export const card = recipe({
  base: {
    aspectRatio: '164 / 240',
    position: 'relative',
    ...pressInteraction(0.95),
    border: `1px solid ${colorVars.color.border.secondary}`,
    borderRadius: unitVars.unit.radius['600'],
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: 0,
    width: '100%',
    overflow: 'hidden',
    font: 'inherit',
  },
  variants: {
    state: {
      default: {},
      selected: {
        border: `1.5px solid ${colorVars.color.border.strong}`,
      },
      disabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
        selectors: {
          '&:active': {
            transform: 'none',
          },
        },
      },
    },
  },
  defaultVariants: {
    state: 'default',
  },
});

export const image = style({
  display: 'block',
  objectFit: 'cover',
  objectPosition: 'center',
  width: '100%',
  height: '100%',
  userSelect: 'none',
});

// 체크박스 — 우상단에 패딩 16px 영역 안에 위치
export const checkbox = recipe({
  base: {
    position: 'absolute',
    top: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: 'transparent',
    pointerEvents: 'none',
    padding: unitVars.unit.gapPadding['400'],
  },
  variants: {
    state: {
      // default: 흰 stroke 빈 동그라미 20×20
      default: {},
      // selected: 다크 배경 24×24, 흰 숫자
      selected: {},
    },
  },
});

// 체크박스 안의 동그라미
export const circle = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition:
      'width 120ms ease, height 120ms ease, background-color 120ms ease',
    borderRadius: unitVars.unit.radius.full,
  },
  variants: {
    state: {
      default: {
        border: `1px solid ${colorVars.color.border.secondary}`,
        backgroundColor: colorVars.color.fill.inverseSecondary,
        width: '2.4rem',
        height: '2.4rem',
      },
      selected: {
        border: 'none',
        backgroundColor: colorVars.color.fill.strong,
        width: '2.4rem',
        height: '2.4rem',
        color: colorVars.color.text.inverse,
        ...fontVars.font.body_m_14,
      },
    },
  },
});
