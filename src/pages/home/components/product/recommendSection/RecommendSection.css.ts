import { style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { unitVars } from '@styles/tokens/unit.css';

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['400'],
  padding: `${unitVars.unit.gapPadding['500']} ${unitVars.unit.gapPadding['000']}`,
  width: '100%',
});

export const title = style({
  margin: 0,
  padding: `0 ${unitVars.unit.gapPadding['500']}`,
  color: colorVars.color.text.primary,
  ...fontVars.font.title_sb_16,
});

export const productGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: unitVars.unit.gapPadding['200'],
  padding: `0 ${unitVars.unit.gapPadding['500']} ${unitVars.unit.gapPadding['600']}`,
  width: '100%',
});
