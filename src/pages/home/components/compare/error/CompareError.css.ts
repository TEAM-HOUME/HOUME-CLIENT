import { style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { unitVars } from '@styles/tokens/unit.css';

export const container = style({
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['600'],
  padding: `8rem ${unitVars.unit.gapPadding['500']} ${unitVars.unit.gapPadding['800']}`,
  width: '100%',
});

export const contents = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
});

export const image = style({
  display: 'block',
  width: '35rem',
  maxWidth: '100%',
  height: 'auto',
});

export const textContents = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: `${unitVars.unit.gapPadding['200']} 0`,
  width: '100%',
});

export const text = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['200'],
  padding: `${unitVars.unit.gapPadding['200']} ${unitVars.unit.gapPadding['100']}`,
  width: '100%',
  textAlign: 'center',
  wordBreak: 'keep-all',
});

export const title = style({
  margin: 0,
  color: colorVars.color.text.primary,
  ...fontVars.font.title_sb_16,
});

export const description = style({
  margin: 0,
  color: colorVars.color.text.tertiary,
  ...fontVars.font.body_r_14,
});

export const email = style({
  textDecoration: 'underline',
  color: 'inherit',
});
