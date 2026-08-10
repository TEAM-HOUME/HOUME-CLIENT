import { globalStyle, style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { unitVars } from '@styles/tokens/unit.css';

export const root = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

export const mainArea = style({
  display: 'flex',
  flexDirection: 'column',
  padding: unitVars.unit.gapPadding['500'],
  width: '100%',
});

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['400'],
  width: '100%',
});

export const title = style({
  ...fontVars.font.title_sb_16,
  padding: `0 ${unitVars.unit.gapPadding['100']}`,
  color: colorVars.color.text.primary,
});

export const content = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['300'],
  width: '100%',
});

export const chipList = style({
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  gap: unitVars.unit.gapPadding['100'],
  touchAction: 'pan-x',
  width: '100%',
  minWidth: 0,
  overflowX: 'auto',
  overflowY: 'hidden',
  overscrollBehaviorX: 'contain',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  WebkitOverflowScrolling: 'touch',
  selectors: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
});

globalStyle(`${chipList} > button`, {
  flexShrink: 0,
});

export const productList = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: unitVars.unit.gapPadding['200'],
  width: '100%',
});

export const blockSlot = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
});

export const categoryLoadingSlot = style([
  blockSlot,
  {
    flexShrink: 0,
    minWidth: '10rem',
    minHeight: '4.4rem',
  },
]);

export const productListFallbackSlot = style({
  display: 'flex',
  gridColumn: '1 / -1',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minHeight: '22rem',
});

export const productListLoadingSlot = style([productListFallbackSlot]);
