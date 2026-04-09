import { style } from '@vanilla-extract/css';

import { colorVars } from '@/shared/styles/tokensV2/color.css';
import { fontVars } from '@/shared/styles/tokensV2/font.css';
import { unitVars } from '@/shared/styles/tokensV2/unit.css';

export const wrapper = style({
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: unitVars.unit.gapPadding['400'],
  margin: `${unitVars.unit.gapPadding['500']} ${unitVars.unit.gapPadding['000']}`,

  width: '100%',
});

export const groupContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['400'],
});

export const date = style({
  ...fontVars.font.body_r_14,
  padding: `${unitVars.unit.gapPadding['000']} ${unitVars.unit.gapPadding['500']}`,
  color: colorVars.color.text.tertiary,
});

export const listContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['600'],
  width: '100%',
});

export const divider = style({
  marginBottom: unitVars.unit.gapPadding['400'],
  backgroundColor: colorVars.color.border.tertiary,
  width: '100%',
  height: '0.2rem',
});
