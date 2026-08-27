import { style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { unitVars } from '@styles/tokens/unit.css';

export const container = style({
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  border: `1px solid ${colorVars.color.border.secondary}`,
  borderRadius: unitVars.unit.radius['600'],
  backgroundColor: colorVars.color.bg.primary,
  width: '100%',
  minWidth: '33.6rem',
  overflow: 'hidden',
});

export const contentButton = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['300'],
  padding: unitVars.unit.gapPadding['400'],
  textAlign: 'left',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${colorVars.color.text.brand}`,
      outlineOffset: '-2px',
      borderRadius: unitVars.unit.radius['300'],
    },
  },
});

export const titleRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['100'],
  width: '100%',
});

export const title = style({
  ...fontVars.font.title_sb_16,
  margin: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: colorVars.color.text.primary,
});

export const productCard = style({
  display: 'flex',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['200'],
  width: '100%',
});

export const imgSection = style({
  boxSizing: 'border-box',
  position: 'relative',
  flexShrink: 0,
  border: `1px solid ${colorVars.color.border.tertiary}`,
  borderRadius: unitVars.unit.radius['300'],
  width: '8rem',
  height: '8rem',
  overflow: 'hidden',
});

export const cardImage = style({
  display: 'block',
  objectFit: 'cover',
  objectPosition: 'center',
  width: '100%',
  height: '100%',
});

export const infoSection = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['100'],
  padding: `${unitVars.unit.gapPadding['000']} ${unitVars.unit.gapPadding['100']}`,
  minWidth: 0,
});

export const brandText = style({
  ...fontVars.font.caption_r_12,
  width: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  lineHeight: '1.1rem',
  whiteSpace: 'nowrap',
  color: colorVars.color.text.tertiary,
});

export const productText = style({
  ...fontVars.font.body_r_14,
  width: '100%',
  height: '2rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: colorVars.color.text.primary,
});

export const priceRow = style({
  ...fontVars.font.title_sb_16,
  display: 'flex',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['050'],
  width: '100%',
  maxWidth: '18rem',
  overflow: 'hidden',
});

export const discountRateText = style({
  flexShrink: 0,
  whiteSpace: 'nowrap',
  color: colorVars.color.text.brand,
});

export const discountPriceText = style({
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: colorVars.color.text.primary,
});

export const searchButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderTop: `1px solid ${colorVars.color.border.secondary}`,
  backgroundColor: colorVars.color.fill.whitish,
  padding: unitVars.unit.gapPadding['400'],
  width: '100%',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${colorVars.color.text.brand}`,
      outlineOffset: '-2px',
    },
  },
});

export const searchButtonContent = style({
  display: 'flex',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['100'],
});

export const searchButtonText = style({
  ...fontVars.font.body_r_14,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: colorVars.color.text.secondary,
});
