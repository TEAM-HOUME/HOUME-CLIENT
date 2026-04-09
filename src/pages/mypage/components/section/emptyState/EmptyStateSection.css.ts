import { style } from '@vanilla-extract/css';

import { colorVars } from '@/shared/styles/tokensV2/color.css';
import { fontVars } from '@/shared/styles/tokensV2/font.css';
import { unitVars } from '@/shared/styles/tokensV2/unit.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: unitVars.unit.gapPadding['500'],
  width: '100%',
});

export const image = style({
  width: '100%',
});

export const contentWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['600'],
  padding: `${unitVars.unit.gapPadding['200']} ${unitVars.unit.gapPadding['000']}`,
});

export const textWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['200'],
  padding: `${unitVars.unit.gapPadding['200']} ${unitVars.unit.gapPadding['100']}`,
});

export const title = style({
  ...fontVars.font.title_sb_16,
  textAlign: 'center',
  whiteSpace: 'nowrap',
  color: colorVars.color.text.primary,
});

export const description = style({
  ...fontVars.font.body_r_14,
  textAlign: 'center',
  whiteSpace: 'pre-line',
  color: colorVars.color.text.tertiary,
});

export const buttonWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: unitVars.unit.gapPadding['600'],
  padding: `${unitVars.unit.gapPadding['200']} ${unitVars.unit.gapPadding['000']}`,
  width: '100%',
});

export const lineButton = style({
  textDecoration: 'underline',
  textUnderlineOffset: '2px',
});
