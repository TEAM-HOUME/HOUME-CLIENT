import { style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { unitVars } from '@styles/tokens/unit.css';

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['400'],
  width: '100%',
});

export const headerRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
});

export const sectionTitle = style({
  ...fontVars.font.title_sb_16,
  padding: `0 ${unitVars.unit.gapPadding['100']}`,
  color: colorVars.color.text.primary,
});

export const cardScroll = style({
  margin: `0 calc(${unitVars.unit.gapPadding['500']} * -1)`,
  width: `calc(100% + ${unitVars.unit.gapPadding['500']} * 2)`,
  overflowX: 'auto',
  overflowY: 'hidden',
  selectors: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
});

export const cardList = style({
  display: 'flex',
  flexWrap: 'nowrap',
  gap: unitVars.unit.gapPadding['200'],
  padding: `0 ${unitVars.unit.gapPadding['500']}`,
  width: 'max-content',
});

export const cardItem = style({
  flexShrink: 0,
  width: '16rem',
});
