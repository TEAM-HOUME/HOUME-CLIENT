import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { pressInteraction } from '@styles/tokens/interaction/presets';
import { unitVars } from '@styles/tokens/unit.css';

export const wrapper = recipe({
  base: {
    display: 'inline-flex',
    flexShrink: 0,
    alignItems: 'center',
    transformOrigin: 'center center',
    ...pressInteraction(0.95),
    border: 0,
    borderRadius: unitVars.unit.radius.full,
    cursor: 'pointer',
    padding: `${unitVars.unit.gapPadding['200']} ${unitVars.unit.gapPadding['300']}`,
    width: 'fit-content',
    maxWidth: '100%',
  },
  variants: {
    type: {
      recent: {
        backgroundColor: colorVars.color.fill.whitish,
      },
      popular: {
        outline: `1px dashed ${colorVars.color.border.primary}`,
        outlineOffset: '-1px',
        backgroundColor: colorVars.color.fill.inverse,
      },
    },
  },
});

export const contents = style({
  display: 'flex',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['200'],
  padding: `${unitVars.unit.gapPadding['050']} ${unitVars.unit.gapPadding['100']}`,
  width: '100%',
});

export const iconGroup = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  gap: unitVars.unit.gapPadding['100'],
});

export const icon = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
});

export const thumbnail = style({
  flexShrink: 0,
  borderRadius: unitVars.unit.radius['100'],
  width: '2rem',
  height: '2rem',
  overflow: 'hidden',
});

export const thumbnailImage = style({
  display: 'block',
  objectFit: 'cover',
  width: '100%',
  height: '100%',
});

export const textGroup = style({
  display: 'flex',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['100'],
  minWidth: 0,
});

export const caption = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: colorVars.color.text.tertiary,
  ...fontVars.font.caption_r_12,
});

export const name = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: colorVars.color.text.primary,
  ...fontVars.font.body_m_14,
});
