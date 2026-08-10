import { style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { unitVars } from '@styles/tokens/unit.css';

export const container = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['800'],
  backgroundColor: colorVars.color.bg.primary,
  width: '100%',
});

export const mainArea = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['800'],
  padding: unitVars.unit.gapPadding['500'],
});

// 주요활동 섹션
export const activitySection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['400'],
});

// 가구 섹션
export const furnitureSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['400'],
});

// 카테고리 리스트 (세로 배열)
export const furList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['400'],
});

// 개별 카테고리 (제목 + chip 리스트)
export const categoryGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['200'],
});

// 카테고리 제목
export const furTitle = style({
  ...fontVars.font.body_m_14,
  padding: `0 ${unitVars.unit.gapPadding['100']}`,
  color: colorVars.color.text.secondary,
});

// Chip 리스트 (flex-wrap)
export const chipList = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: unitVars.unit.gapPadding['100'],
});

// CTA 버튼 영역
export const buttonWrapper = style({
  padding: `0 ${unitVars.unit.gapPadding['500']}`,
  paddingBottom: unitVars.unit.gapPadding['500'],
});
