import { style, styleVariants } from '@vanilla-extract/css';

import { colorVars } from '@/shared/styles/tokensV2/color.css';
import { fontVars } from '@/shared/styles/tokensV2/font.css';
import { unitVars } from '@/shared/styles/tokensV2/unit.css';

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
