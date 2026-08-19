import { style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { unitVars } from '@styles/tokens/unit.css';

export const badge = style({
  display: 'inline-flex',
  alignItems: 'center',
  alignSelf: 'flex-start',
  justifyContent: 'center',
  borderRadius: '0.6rem',
  backgroundColor: colorVars.color.fill.safeWeak,
  padding: `${unitVars.unit.gapPadding['100']} ${unitVars.unit.gapPadding['200']}`,
});

export const contents = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['100'],
});

export const priceContainer = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['050'],
  whiteSpace: 'nowrap',
});

export const priceText = style({
  ...fontVars.font.body_m_13,
  color: colorVars.color.fill.safe,
});
