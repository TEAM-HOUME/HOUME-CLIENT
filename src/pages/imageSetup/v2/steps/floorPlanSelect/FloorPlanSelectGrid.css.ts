import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { unitVars } from '@styles/tokens/unit.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  minHeight: 0,
  overflow: 'hidden',
});

export const chipBar = style({
  display: 'flex',
  flexShrink: 0,
  gap: unitVars.unit.gapPadding['100'],
  padding: `${unitVars.unit.gapPadding['200']} ${unitVars.unit.gapPadding['500']}`,
  overflowX: 'auto',
  overflowY: 'hidden',
  scrollbarWidth: 'none',
  whiteSpace: 'nowrap',
  msOverflowStyle: 'none',
  selectors: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
});

export const gridScroll = style({
  flex: 1,
  padding: `${unitVars.unit.gapPadding['300']} ${unitVars.unit.gapPadding['500']}`,
  overflow: 'auto',
});

// 개수 표시 + 비율 토글 행 (chipBar와 gridScroll 사이)
export const listControl = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: colorVars.color.bg.primary,
  padding: `0 ${unitVars.unit.gapPadding['500']}`,
});

export const countText = style({
  margin: 0,
  padding: `0 ${unitVars.unit.gapPadding['100']}`,
  color: colorVars.color.text.tertiary,
  ...fontVars.font.body_r_13,
});

export const ratioToggle = style({
  display: 'flex',
  alignItems: 'center',
});

export const toggleDivider = style({
  flexShrink: 0,
  backgroundColor: colorVars.color.border.primary,
  width: '0.1rem', // 1px (1rem=10px)
  height: '1.4rem', // 14px
});

export const divider = style({
  margin: `${unitVars.unit.gapPadding['800']} calc(${unitVars.unit.gapPadding['500']} * -1)`,
  backgroundColor: colorVars.color.border.secondary,
  width: `calc(100% + ${unitVars.unit.gapPadding['500']} * 2)`,
  height: '0.8rem',
});

export const grid = recipe({
  base: {
    display: 'grid',
    justifyItems: 'center',
    gap: unitVars.unit.gapPadding['200'],
  },
  variants: {
    // 1:1: 2열 / 3:2: 1열(한 장씩)
    ratio: {
      '1:1': { gridTemplateColumns: 'repeat(2, 1fr)' },
      '3:2': { gridTemplateColumns: '1fr' },
    },
  },
  defaultVariants: { ratio: '1:1' },
});

export const chipIcon = style({
  flexShrink: 0,
  width: '1.2rem',
  height: '1.2rem',
});

// --- filtered-none 빈 결과 상태 (isExact: false) ---

export const emptyContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['200'],
  padding: `${unitVars.unit.gapPadding['200']} ${unitVars.unit.gapPadding['100']}`,
});

export const emptyTitle = style({
  margin: 0,
  textAlign: 'center',
  color: colorVars.color.text.secondary,
  ...fontVars.font.title_m_16,
});

export const emptyDescription = style({
  margin: 0,
  textAlign: 'center',
  whiteSpace: 'pre-line',
  color: colorVars.color.text.tertiary,
  ...fontVars.font.body_r_13,
});

// --- "선택한 필터와 유사한 공간" 섹션 ---

export const similarSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['300'],
});

export const similarTitle = style({
  margin: 0,
  padding: `0 ${unitVars.unit.gapPadding['100']}`,
  ...fontVars.font.title_sb_16,
  color: colorVars.color.text.primary,
});
