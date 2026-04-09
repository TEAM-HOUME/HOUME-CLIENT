import { style } from '@vanilla-extract/css';

import { zIndex } from '@styles/tokens/zIndex';
import { colorVars } from '@styles/tokensV2/color.css';
import { fontVars } from '@styles/tokensV2/font.css';
import { unitVars } from '@styles/tokensV2/unit.css';

export const page = style({
  display: 'flex',
  flexDirection: 'column',
});

export const body = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: unitVars.unit.gapPadding['700'],
  padding: `${unitVars.unit.gapPadding['300']} ${unitVars.unit.gapPadding['500']} ${unitVars.unit.gapPadding['400']} ${unitVars.unit.gapPadding['500']}`,
});

export const bannerContainer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
});

export const questionContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['400'],
  width: '100%',
});

export const question = style({
  padding: `${unitVars.unit.gapPadding['000']} ${unitVars.unit.gapPadding['100']}`,
  ...fontVars.font.title_sb_16,
  color: colorVars.color.text.primary,
});

export const optionList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['200'],
});

export const optionRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['100'],
  borderRadius: unitVars.unit.radius.full,
  cursor: 'pointer',
  padding: `${unitVars.unit.gapPadding['200']} ${unitVars.unit.gapPadding['400']}`,
  width: '100%',
  textAlign: 'left',
  selectors: {
    '&[aria-checked="true"]': {
      backgroundColor: colorVars.color.fill.weak,
    },
  },
});

export const optionIcon = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  lineHeight: 0,
});

export const optionLabel = style({
  padding: `${unitVars.unit.gapPadding['000']} ${unitVars.unit.gapPadding['100']}`,
  ...fontVars.font.body_r_14,
  color: colorVars.color.text.primary,
});

export const ctaBar = style({
  position: 'fixed',
  zIndex: zIndex.sticky,
  bottom: 0,
  padding: unitVars.unit.gapPadding['500'],
  width: '100%',
  maxWidth: unitVars.unit.dimension.wMax,
});
