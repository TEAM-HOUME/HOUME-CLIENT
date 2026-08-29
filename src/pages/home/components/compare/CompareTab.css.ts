import { style } from '@vanilla-extract/css';

import { unitVars } from '@styles/tokens/unit.css';

export const container = style({
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  alignSelf: 'stretch',
  width: '100%',
  minWidth: 0,
  maxWidth: unitVars.unit.dimension.wMax,
});

export const content = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

/** empty 화면 — 공용 EmptyView 아래에 입력 화면으로 돌아가는 버튼을 둔다 */
export const fallback = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1.6rem',
  padding: '4rem 0',
});
