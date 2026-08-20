import { style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { unitVars } from '@styles/tokens/unit.css';

export const badge = style({
  display: 'inline-flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: unitVars.unit.radius['100'],
  backgroundColor: colorVars.color.fill.brandWeak,
  padding: `${unitVars.unit.gapPadding['050']} ${unitVars.unit.gapPadding['100']}`,
  color: colorVars.color.text.brand,
  ...fontVars.font.caption_sb_10,
});
