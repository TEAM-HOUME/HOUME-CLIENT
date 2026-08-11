import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { transition } from '@styles/tokens/interaction/utils';
import { unitVars } from '@styles/tokens/unit.css';

// 최소화 시 헤더가 접히는 트랜지션 (패널 height 슬라이드와 동일 duration/easing)
const collapseTransition = [
  transition('max-height'),
  transition('opacity'),
].join(', ');

export const container = recipe({
  base: {
    display: 'flex',
    flexDirection: 'column',
    // Figma contentSlot gap = gap/100 (4px)
    gap: unitVars.unit.gapPadding['100'],
    width: '100%',
  },
  variants: {
    minimized: {
      true: { gap: unitVars.unit.gapPadding['000'] },
      false: {},
    },
  },
  defaultVariants: {
    minimized: false,
  },
});

// 최소화 시 헤더("선택한 상품 n/6")를 접어서 숨김 (양방향 트랜지션 위해 base에 유한 maxHeight)
export const headerRow = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: unitVars.unit.gapPadding['100'],
    transition: collapseTransition,
    padding: `${unitVars.unit.gapPadding['000']} ${unitVars.unit.gapPadding['100']}`,
    // 헤더 실제 높이(~2.7rem) 바로 위 — reveal 타이밍을 버튼/패널과 맞춤
    maxHeight: '3rem',
    overflow: 'hidden',
  },
  variants: {
    minimized: {
      true: { opacity: 0, maxHeight: 0 },
      false: {},
    },
  },
  defaultVariants: {
    minimized: false,
  },
});

export const title = style({
  color: colorVars.color.text.primary,
  ...fontVars.font.title_sb_18,
});

export const count = style({
  color: colorVars.color.text.tertiary,
  ...fontVars.font.body_r_14,
});

export const selectedCount = style({
  color: colorVars.color.text.primary,
  ...fontVars.font.title_sb_14,
});

export const compactRow = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(6, 1fr)',
  gap: unitVars.unit.gapPadding['050'],
  padding: `${unitVars.unit.gapPadding['050']} ${unitVars.unit.gapPadding['100']}`,
  width: '100%',
});

export const compactSlot = style({
  aspectRatio: '1 / 1',
  border: `1px solid ${colorVars.color.border.tertiary}`,
  borderRadius: unitVars.unit.radius['300'],
  backgroundColor: colorVars.color.bg.primary,
  cursor: 'pointer',
});

export const expandedGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  alignItems: 'start',
  gap: unitVars.unit.gapPadding['200'],
  padding: `0 ${unitVars.unit.gapPadding['100']}`,
  width: '100%',
});

export const expandedGridSlot = style({
  width: '100%',
  minWidth: 0,
});

export const addCardSquare = style({
  boxSizing: 'border-box',
  aspectRatio: '1 / 1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px solid ${colorVars.color.border.tertiary}`,
  borderRadius: unitVars.unit.radius['300'],
  backgroundColor: colorVars.color.bg.primary,
  cursor: 'pointer',
  width: '100%',
  maxWidth: '100%',
});

export const addCardContent = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: unitVars.unit.gapPadding['100'],
});

export const addLabel = style({
  margin: 0,
  textAlign: 'center',
  ...fontVars.font.caption_r_12,
  color: colorVars.color.text.disabled,
});
