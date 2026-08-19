import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { unitVars } from '@styles/tokens/unit.css';
import { zIndex } from '@styles/tokens/zIndex';

const NAV_BAR_CONTENT_HEIGHT = '4.8rem';

export const container = style({
  boxSizing: 'border-box',
  zIndex: zIndex.navBar,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingTop: 'env(safe-area-inset-top, 0px)',
  width: '100%',
  minWidth: unitVars.unit.dimension.wMin,
  maxWidth: unitVars.unit.dimension.wMax,
  height: `calc(${NAV_BAR_CONTENT_HEIGHT} + env(safe-area-inset-top, 0px))`,
});

export const leftContainer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingRight: unitVars.unit.gapPadding['500'],
  paddingLeft: unitVars.unit.gapPadding['500'],
  height: '100%',
});

export const logoButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const logoImage = style({
  display: 'block',
  width: '7.2rem',
  height: '1.6rem',
});

export const rightContainer = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  variants: {
    hasAction: {
      false: {
        paddingRight: unitVars.unit.gapPadding['200'],
        paddingLeft: unitVars.unit.gapPadding['200'],
        width: '8rem',
      },
      true: {
        paddingRight: unitVars.unit.gapPadding['200'],
        paddingLeft: unitVars.unit.gapPadding['200'],
      },
    },
  },
});

export const actionContainer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingRight: unitVars.unit.gapPadding['200'],
  paddingLeft: unitVars.unit.gapPadding['200'],
  height: '100%',
});

export const generateButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: unitVars.unit.gapPadding['100'],
  border: 0,
  borderRadius: unitVars.unit.radius.full,
  backgroundColor: colorVars.color.fill.primary,
  paddingRight: unitVars.unit.gapPadding['300'],
  paddingLeft: unitVars.unit.gapPadding['300'],
  height: '4rem',
});

export const icon16 = style({
  flexShrink: 0,
  width: '1.6rem',
  height: '1.6rem',
});

export const generateLabel = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingRight: unitVars.unit.gapPadding['100'],
  paddingLeft: unitVars.unit.gapPadding['100'],
  whiteSpace: 'nowrap',
  color: colorVars.color.text.inverse,
  ...fontVars.font.title_sb_14,
});

export const loginButton = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 0,
    background: 'transparent',
    paddingRight: unitVars.unit.gapPadding['100'],
    paddingLeft: unitVars.unit.gapPadding['100'],
    ...fontVars.font.body_r_14,
  },
  variants: {
    page: {
      landing: {
        color: colorVars.color.text.primary,
      },
      home: {
        color: colorVars.color.text.inverse,
      },
    },
  },
});

export const profileButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 0,
  background: 'transparent',
  padding: unitVars.unit.gapPadding['100'],
  width: '4.8rem',
  height: '4.8rem',
});

export const profileImage = style({
  display: 'block',
  borderRadius: unitVars.unit.radius.full,
  width: '4rem',
  height: '4rem',
});
