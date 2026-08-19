import { style } from '@vanilla-extract/css';

import { unitVars } from '@styles/tokens/unit.css';
import { zIndex } from '@styles/tokens/zIndex';

export const container = style({
  position: 'relative',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['800'],
  marginBottom: '9.6rem',
  padding: unitVars.unit.gapPadding['500'],
  width: '100%',
});

export const headingWrapper = style({
  display: 'flex',
  width: '100%',
});

// 데스크탑·모바일 모두에서 44rem 가상 프레임의 우하단에 2rem씩 띄운 floating 버튼
// - 모바일(뷰포트 ≤ 44rem): right: 2rem — 뷰포트 우측에서 2rem
// - 데스크탑(뷰포트 > 44rem): right: calc((100vw - 44rem) / 2 + 2rem) — 프레임 우측에서 2rem 안쪽
// - max()로 두 경우를 한 식에 통합
export const buttonWrapper = style({
  position: 'fixed',
  zIndex: zIndex.button,
  right: 'max(2rem, calc((100vw - 44rem) / 2 + 2rem))',
  bottom: '2rem',
});
