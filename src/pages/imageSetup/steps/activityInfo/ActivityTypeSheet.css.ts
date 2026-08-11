import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { pressTransformInteraction } from '@styles/tokens/interaction/presets';
import { unitVars } from '@styles/tokens/unit.css';

export const contents = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['500'],
  width: '100%',
});

export const radioList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['100'],
  width: '100%',
});

export const radioItem = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    transformOrigin: 'center center',
    transition: [pressTransformInteraction, 'background-color 120ms ease'].join(
      ', '
    ),
    border: 'none',
    borderRadius: unitVars.unit.radius.full,
    cursor: 'pointer',
    padding: `${unitVars.unit.gapPadding['200']} ${unitVars.unit.gapPadding['400']}`,
    width: '100%',
    minWidth: '6.4rem',
    height: '4.4rem',
    font: 'inherit',
    selectors: {
      '&:active': {
        transform: 'scale(0.95)',
      },
    },
  },
  variants: {
    selected: {
      false: {
        backgroundColor: colorVars.color.fill.inverse,
      },
      true: {
        backgroundColor: colorVars.color.fill.weak,
      },
    },
  },
});

export const radioContents = style({
  display: 'flex',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['100'],
});

export const radioLabel = style({
  ...fontVars.font.body_r_14,
  color: colorVars.color.text.primary,
});

export const divider = recipe({
  base: {
    borderRadius: '50%',
    width: '0.3rem',
    height: '0.3rem',
  },
  variants: {
    selected: {
      false: {
        backgroundColor: colorVars.color.text.tertiary,
      },
      true: {
        backgroundColor: colorVars.color.text.secondary,
      },
    },
  },
});

export const requiredLabel = recipe({
  base: {
    ...fontVars.font.body_r_14,
  },
  variants: {
    selected: {
      false: {
        color: colorVars.color.text.tertiary,
      },
      true: {
        color: colorVars.color.text.secondary,
      },
    },
  },
});
