import { style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { unitVars } from '@styles/tokens/unit.css';

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

export const popupContent = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

export const popupTitle = style({
  ...fontVars.font.title_sb_16,
  marginBottom: unitVars.unit.gapPadding['200'],
  textAlign: 'center',
  color: colorVars.color.text.primary,
});

export const popupDetail = style({
  ...fontVars.font.body_r_14,
  textAlign: 'center',
  color: colorVars.color.text.secondary,
});
