import { style } from '@vanilla-extract/css';

import { unitVars } from '@/shared/styles/tokensV2/unit.css';

export const container = style({
  boxSizing: 'border-box',
  display: 'flex',
  justifyContent: 'center',
  padding: unitVars.unit.gapPadding['500'],
  width: '100%',
});

export const gridContainer = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  rowGap: '0',
  columnGap: unitVars.unit.gapPadding['200'],
  width: '100%',
});

export const cardWrapper = style({
  minWidth: '100%',
});
