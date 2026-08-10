import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { pressInteraction } from '@styles/tokens/interaction/presets';
import { unitVars } from '@styles/tokens/unit.css';

export const optionCard = recipe({
  base: {
    position: 'relative',
    display: 'flex',
    flexShrink: 0,
    alignItems: 'flex-start',
    ...pressInteraction(0.95),
    border: 0,
    borderRadius: unitVars.unit.radius['600'],
    overflow: 'hidden',
    textAlign: 'left',
  },
  variants: {
    kind: {
      default: {
        flexDirection: 'column',
        // 이미지 로드 전 노출 시 깜빡임 완화 위해 회색 placeholder 배경
        backgroundColor: colorVars.color.fill.disabled,
      },
      more: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colorVars.color.fill.weak,
      },
    },
    size: {
      s: {
        padding: unitVars.unit.gapPadding['300'],
        width: '100%',
        minWidth: '16rem',
      },
      m: {
        padding: unitVars.unit.gapPadding['300'],
        width: '100%',
        minWidth: '16.4rem',
      },
    },
    // 카드 비율 — 도면 그리드에서 1:1 / 3:2 토글에 사용. 미전달 시 defaultVariants로 1:1 유지
    ratio: {
      '1:1': { aspectRatio: '1 / 1' },
      '3:2': { aspectRatio: '3 / 2' },
    },
  },
  compoundVariants: [
    {
      variants: { size: 'm', ratio: '3:2' },
      style: { padding: unitVars.unit.gapPadding['400'] },
    },
  ],
  defaultVariants: {
    ratio: '1:1',
  },
});

export const previewCard = style({
  aspectRatio: '1 / 1',
  position: 'relative',
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: unitVars.unit.radius['600'],
  backgroundColor: colorVars.color.fill.weak,
  padding: unitVars.unit.gapPadding['100'],
  width: '100%',
  minWidth: '32.7rem',
  overflow: 'hidden',
});

export const image = style({
  position: 'absolute',
  inset: 0,
  objectFit: 'cover',
  pointerEvents: 'none',
  width: '100%',
  height: '100%',
});

export const gradient = style({
  position: 'absolute',
  inset: 0,
  background:
    'linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0) 39.71%)',
});

export const optionInfoRow = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'flex-start',
  padding: `0 ${unitVars.unit.gapPadding['100']}`,
  width: '100%',
  color: colorVars.color.text.inverse,
});

// 최대 2줄까지 노출하고, 넘어가면 말줄임(...) 처리
export const optionTitle = recipe({
  base: {
    display: '-webkit-box',
    flex: 1,
    margin: 0,
    maxHeight: '4rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: colorVars.color.text.inverse,
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    ...fontVars.font.body_m_13,
  },
  variants: {
    size: { s: {}, m: {} },
    ratio: { '1:1': {}, '3:2': {} },
  },
  compoundVariants: [
    {
      variants: { size: 'm', ratio: '3:2' },
      style: { ...fontVars.font.title_m_15 },
    },
  ],
  defaultVariants: {
    size: 's',
    ratio: '1:1',
  },
});

export const optionFooter = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  marginTop: 'auto',
  width: '100%',
});

export const recentBadge = style({
  color: colorVars.color.text.inverse,
  ...fontVars.font.body_m_13,
});

export const moreContent = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: unitVars.unit.gapPadding['100'],
  width: '100%',
  height: '100%',
});

export const plusIcon = style({
  flexShrink: 0,
  width: '2.4rem',
  height: '2.4rem',
});

export const moreLabelContainer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingTop: unitVars.unit.gapPadding['200'],
  paddingBottom: unitVars.unit.gapPadding['200'],
});

export const moreLabel = style({
  margin: 0,
  textAlign: 'center',
  whiteSpace: 'pre-line',
  color: colorVars.color.text.tertiary,
  ...fontVars.font.body_m_14,
});

export const previewNavButton = style({
  position: 'relative',
  zIndex: 1,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...pressInteraction(0.95),
  border: 0,
  background: 'transparent',
  padding: unitVars.unit.gapPadding['200'],
  width: '3.6rem',
  height: '3.6rem',
});
