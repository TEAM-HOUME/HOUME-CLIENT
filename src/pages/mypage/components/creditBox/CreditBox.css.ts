import { style, styleVariants } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { unitVars } from '@styles/tokens/unit.css';

export const container = style({
  boxSizing: 'border-box',
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['100'],
  borderRadius: unitVars.unit.radius.full,
  backgroundColor: colorVars.color.fill.weak,
  padding: `${unitVars.unit.gapPadding['000']} ${unitVars.unit.gapPadding['300']} ${unitVars.unit.gapPadding['000']} ${unitVars.unit.gapPadding['200']}`,
  height: '3.6rem',
});

export const textWrapper = style({
  display: 'flex',
  gap: '0.1rem',
  width: '100%',
  minWidth: '2.7rem',
});

export const text = styleVariants({
  primary: {
    ...fontVars.font.title_sb_16,
    color: colorVars.color.text.primary,
  },
  default: {
    ...fontVars.font.title_m_16,
    color: colorVars.color.text.tertiary,
  },
});
