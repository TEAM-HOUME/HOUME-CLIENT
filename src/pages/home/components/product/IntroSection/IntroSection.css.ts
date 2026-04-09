import { style } from '@vanilla-extract/css';

import { unitVars } from '@styles/tokensV2/unit.css';

/** 비율 박스 — introBanner가 inset으로 프레임에 맞게 채움 */
export const section = style({
  boxSizing: 'border-box',
  aspectRatio: '37.5 / 22',
  position: 'relative',
  width: '100%',
  minWidth: unitVars.unit.dimension.wMin,
  maxWidth: unitVars.unit.dimension.wMax,
  overflow: 'hidden',
});

export const introBanner = style({
  position: 'absolute',
  inset: 0,
  display: 'block',
  objectFit: 'cover',
  objectPosition: 'center',
  width: '100%',
  height: '100%',
});
