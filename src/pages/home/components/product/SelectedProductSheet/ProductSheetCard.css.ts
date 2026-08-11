import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { pressInteraction } from '@styles/tokens/interaction/presets';
import { unitVars } from '@styles/tokens/unit.css';

const compactCardBase = style({
  aspectRatio: '1 / 1',
  border: `1px solid ${colorVars.color.border.tertiary}`,
  borderRadius: unitVars.unit.radius['300'],
  backgroundColor: colorVars.color.bg.primary,
});

export const compactSlotContainer = style({
  aspectRatio: '1 / 1',
  position: 'relative',
  width: '100%',
});

export const compactSlotFilled = style([
  compactCardBase,
  {
    ...pressInteraction(0.9),
    cursor: 'pointer',
    overflow: 'hidden',
  },
]);

export const compactImageWrap = style({
  position: 'relative',
  width: '100%',
  height: '100%',
});

export const compactImage = style({
  display: 'block',
  objectFit: 'cover',
  width: '100%',
  height: '100%',
});

export const compactImageFallback = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  color: colorVars.color.text.disabled,
});

export const selectedCardContainer = style({
  position: 'relative',
  width: '100%',
  minWidth: 0,
});

export const selectedCard = style({
  display: 'flex',
  flexDirection: 'column',
  ...pressInteraction(0.95),
  cursor: 'pointer',
  width: '100%',
});

export const selectedImage = style({
  display: 'block',
  objectFit: 'cover',
  width: '100%',
  height: '100%',
});

export const selectedImageWrap = style({
  aspectRatio: '1 / 1',
  position: 'relative',
  outline: `1px solid ${colorVars.color.border.tertiary}`,
  borderRadius: unitVars.unit.radius['300'],
  backgroundColor: colorVars.color.bg.primary,
  width: '100%',
  overflow: 'hidden',
});

export const selectedImageFallback = style({
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  color: colorVars.color.text.disabled,
});

export const closeButton = recipe({
  base: {
    position: 'absolute',
    zIndex: 2,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: unitVars.unit.radius.full,
    padding: 0,
  },
  variants: {
    layout: {
      expanded: {
        top: '-0.4rem',
        right: '-0.4rem',
      },
      compact: {
        top: '-0.25rem',
        right: '-0.25rem',
      },
    },
  },
});

export const selectedInfoSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['050'],
  padding: `calc(${unitVars.unit.gapPadding['200']} + ${unitVars.unit.gapPadding['050']}) ${unitVars.unit.gapPadding['050']}`,
  width: '100%',
  minWidth: 0,
});

export const selectedTitle = style({
  display: '-webkit-box',
  margin: 0,
  overflow: 'hidden',
  overflowWrap: 'break-word',
  textOverflow: 'ellipsis',
  color: colorVars.color.text.primary,
  ...fontVars.font.caption_r_12,
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
});

export const selectedPriceRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.1rem',
});

export const selectedDiscountRate = style({
  ...fontVars.font.body_m_13,
  color: colorVars.color.text.brand,
});

export const selectedPrice = style({
  ...fontVars.font.body_m_13,
  color: colorVars.color.text.primary,
});
