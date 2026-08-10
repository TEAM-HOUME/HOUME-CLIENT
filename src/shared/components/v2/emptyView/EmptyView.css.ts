import { style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { unitVars } from '@styles/tokens/unit.css';

export const root = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: `${unitVars.unit.gapPadding['500']} ${unitVars.unit.gapPadding['000']}`,
  width: '100%',
});

export const image = style({
  display: 'block',
  width: '100%',
  height: 'auto',
});

export const textContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['000'],
  padding: unitVars.unit.gapPadding['400'],
  width: '100%',
});

export const title = style({
  margin: 0,
  textAlign: 'center',
  color: colorVars.color.text.secondary,
  ...fontVars.font.title_sb_16,
});

export const description = style({
  margin: 0,
  textAlign: 'center',
  whiteSpace: 'pre-line',
  color: colorVars.color.text.tertiary,
  ...fontVars.font.body_r_14,
});
