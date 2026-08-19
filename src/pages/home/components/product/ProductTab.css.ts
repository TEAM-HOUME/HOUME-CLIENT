import { style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { unitVars } from '@styles/tokens/unit.css';

import { PRODUCT_BOTTOM_SHEET_COLLAPSED_HEIGHT } from '../../constants/productTab';

export const container = style({
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  alignSelf: 'stretch',
  paddingBottom: PRODUCT_BOTTOM_SHEET_COLLAPSED_HEIGHT,
  width: '100%',
  minWidth: unitVars.unit.dimension.wMin,
  maxWidth: unitVars.unit.dimension.wMax,
});

export const filterSheetTitle = style({
  color: colorVars.color.text.primary,
  ...fontVars.font.title_m_16,
});
