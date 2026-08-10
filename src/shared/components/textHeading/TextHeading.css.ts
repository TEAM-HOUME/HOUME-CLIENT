import { recipe } from '@vanilla-extract/recipes';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { unitVars } from '@styles/tokens/unit.css';

export const wrapper = recipe({
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
  },
  variants: {
    type: {
      main: { gap: unitVars.unit.gapPadding['200'] },
      sub: {
        gap: unitVars.unit.gapPadding['050'],
        padding: `${unitVars.unit.gapPadding['000']} ${unitVars.unit.gapPadding['100']}`,
      },
      popupModal: {
        alignItems: 'center',
        gap: unitVars.unit.gapPadding['200'],
      },
      bottomSheet: { gap: unitVars.unit.gapPadding['100'] },
    },
  },
});

export const title = recipe({
  base: {
    color: colorVars.color.text.primary,
  },
  variants: {
    type: {
      main: { ...fontVars.font.title_sb_20 },
      sub: {
        ...fontVars.font.title_sb_16,
        color: colorVars.color.text.secondary,
      },
      popupModal: { ...fontVars.font.title_sb_18 },
      bottomSheet: { ...fontVars.font.title_sb_18 },
    },
  },
});

export const caption = recipe({
  base: {
    ...fontVars.font.body_r_14,
    whiteSpace: 'pre-line',
    color: colorVars.color.text.secondary,
  },
  variants: {
    type: {
      main: {},
      sub: {
        ...fontVars.font.body_r_13,
        color: colorVars.color.text.tertiary,
      },
      popupModal: {},
      bottomSheet: {},
    },
  },
});
