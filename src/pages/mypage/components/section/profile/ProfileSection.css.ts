import { style } from '@vanilla-extract/css';

import { fontVars } from '@/shared/styles/tokensV2/font.css';
import { unitVars } from '@/shared/styles/tokensV2/unit.css';

export const container = style({
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${unitVars.unit.gapPadding['300']} ${unitVars.unit.gapPadding['500']}`,
  width: '100%',
  maxWidth: '100%',
});

export const profileBox = style({
  display: 'flex',
  flex: '0 1 auto',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['300'],
});

export const profileImage = style({
  flexShrink: 0,
  borderRadius: unitVars.unit.radius.full,
  width: '4.8rem',
  height: '4.8rem',
});

export const userName = style({
  ...fontVars.font.title_sb_16,
  flex: '0 0 auto',
  whiteSpace: 'nowrap',
});
