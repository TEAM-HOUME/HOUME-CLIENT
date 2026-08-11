import type { CSSProperties } from 'react';

import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { unitVars } from '@styles/tokens/unit.css';

export const container = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: unitVars.unit.gapPadding['050'],
    borderRadius: unitVars.unit.radius.full,
    backgroundColor: colorVars.color.fill.secondary,
    padding: `${unitVars.unit.gapPadding['200']} ${unitVars.unit.gapPadding['400']}`,
    minWidth: '8rem',
    maxWidth: '33.5rem',
    height: '4.4rem',
  },
  variants: {
    type: {
      info: {},
      success: {},
      error: {},
      action: {
        gap: unitVars.unit.gapPadding['300'],
        padding: `${unitVars.unit.gapPadding['200']} ${unitVars.unit.gapPadding['500']}`,
      },
    },
  },
  defaultVariants: {
    type: 'info',
  },
});

export const message = recipe({
  base: {
    ...fontVars.font.body_r_14,
    color: colorVars.color.text.inverse,
  },
  variants: {
    type: {
      default: {
        padding: `${unitVars.unit.gapPadding['000']} ${unitVars.unit.gapPadding['050']}`,
      },
      action: {},
    },
  },
});

export const actionButton = style({
  textDecoration: 'underline',
  ...fontVars.font.body_m_14,
});

export const toastStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  boxShadow: 'none',
  backgroundColor: 'transparent',
  width: '100%',
};
