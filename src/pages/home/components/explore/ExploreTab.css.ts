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
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['700'],
  padding: unitVars.unit.gapPadding['500'],
  width: '100%',
});

export const promoBannerButton = style({
  display: 'block',
  border: 0,
  background: 'transparent',
  cursor: 'pointer',
  padding: 0,
  width: '100%',
});

export const promoBannerImage = style({
  display: 'block',
  width: '100%',
  height: 'auto',
});
