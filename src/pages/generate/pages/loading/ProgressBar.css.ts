import { style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { unitVars } from '@styles/tokens/unit.css';

export const progressBarBox = style({
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['300'],
  borderRadius: unitVars.unit.radius.full,
  width: '100%',
});

export const progressTrack = style({
  display: 'grid',
  alignItems: 'center',
  marginRight: '-2rem', // 오른쪽 여백 제거
  marginLeft: '-2rem', // 왼쪽 여백 제거
});

export const progressBack = style({
  gridArea: '1 / 1',
  backgroundColor: colorVars.color.fill.weak,
  width: '100%',
  height: '0.4rem',
  overflow: 'hidden',
});

export const progressBar = style({
  gridArea: '1 / 1',
  justifySelf: 'start',
  transition: 'width 0.3s ease-out',
  borderRadius: `0 ${unitVars.unit.radius.full} ${unitVars.unit.radius.full} 0`,
  background: `linear-gradient(90deg, rgba(28, 30, 34, 0.00) 0%, #1C1E22 100%)`,
  minWidth: '3.6rem',
  height: '100%',
});

export const progressInfo = style({
  display: 'flex',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['200'],
  padding: `0 ${unitVars.unit.gapPadding['300']}`,
});

export const loadTextContainer = style({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  minWidth: 0,
});

export const loadText = style({
  display: 'flex',
  ...fontVars.font.body_r_13,
  textAlign: 'center',
  whiteSpace: 'nowrap',
  color: colorVars.color.text.tertiary,
});

export const progressPercent = style({
  ...fontVars.font.caption_r_12,
  flexShrink: 0,
  borderRadius: unitVars.unit.radius.full,
  backgroundColor: colorVars.color.fill.weak,
  padding: `${unitVars.unit.gapPadding['050']} ${unitVars.unit.gapPadding['200']}`,
  textAlign: 'center',
  color: colorVars.color.text.secondary,
  fontVariantNumeric: 'tabular-nums', // 숫자 간격 고정
});
