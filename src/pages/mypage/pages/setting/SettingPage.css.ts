import { style } from '@vanilla-extract/css';

import { colorVars } from '@/shared/styles/tokensV2/color.css';
import { fontVars } from '@/shared/styles/tokensV2/font.css';
import { unitVars } from '@/shared/styles/tokensV2/unit.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['800'],
  padding: unitVars.unit.gapPadding['500'],
  width: '100%',
  minHeight: '100vh',
});

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['300'],
});

export const sectionTitle = style({
  display: 'block',
  ...fontVars.font.title_sb_16,
  padding: `${unitVars.unit.gapPadding['100']} ${unitVars.unit.gapPadding['000']}`,
  color: colorVars.color.text.primary,
});

export const buttonItem = style({
  display: 'block',
  padding: `${unitVars.unit.gapPadding['200']} ${unitVars.unit.gapPadding['000']}`,
});
