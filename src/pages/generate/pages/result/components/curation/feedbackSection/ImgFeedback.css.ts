import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { tagGroupOpenInteraction } from '@styles/tokens/interaction/presets';
import { unitVars } from '@styles/tokens/unit.css';

export const section = style({
  width: '100%',
});

export const box = style({
  display: 'flex',
  flexDirection: 'column',
  border: `1px solid ${colorVars.color.border.secondary}`,
  borderRadius: unitVars.unit.radius['600'],
  backgroundColor: colorVars.color.fill.inverse,
  padding: `${unitVars.unit.gapPadding['400']} ${unitVars.unit.gapPadding['300']}`,
});

export const contentBox = style({
  display: 'flex',
  justifyContent: 'space-between',
});

export const textGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['000'],
  padding: `0 ${unitVars.unit.gapPadding['200']}`,
});

export const title = style({
  ...fontVars.font.body_m_14,
  color: colorVars.color.text.primary,
});

export const description = style({
  ...fontVars.font.caption_r_12,
  color: colorVars.color.text.tertiary,
});

export const buttonGroup = style({
  display: 'flex',
});
export const tagGroup = recipe({
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: unitVars.unit.gapPadding['100'],
    transition: tagGroupOpenInteraction,
    overflow: 'hidden',
  },
  variants: {
    opened: {
      false: {
        opacity: 0,
        pointerEvents: 'none',
        paddingTop: 0,
        height: 0,
      },
      true: {
        opacity: 1,
        paddingTop: unitVars.unit.gapPadding['400'],
        height: 'auto',
      },
    },
  },
  defaultVariants: {
    opened: false,
  },
});

export const tagRow = style({
  display: 'flex',
  gap: unitVars.unit.gapPadding['100'],
});
