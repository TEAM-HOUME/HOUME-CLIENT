import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { pressInteraction } from '@styles/tokens/interaction/presets';
import { unitVars } from '@styles/tokens/unit.css';
import { zIndex } from '@styles/tokens/zIndex';

export const menuTabBar = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderBottom: `0.2rem solid ${colorVars.color.border.tertiary}`,
    background: colorVars.color.fill.inverse,
    padding: `${unitVars.unit.gapPadding['000']} ${unitVars.unit.gapPadding['500']}`,
    width: '100%',
    height: '4.2rem',
  },
  variants: {
    sticky: {
      true: {
        position: 'sticky',
        zIndex: zIndex.sticky,
        top: 'env(safe-area-inset-top, 0px)',
      },
      false: {
        position: 'static',
      },
    },
  },
  defaultVariants: {
    sticky: true,
  },
});

export const tabButton = recipe({
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transformOrigin: 'center center',
    ...pressInteraction(0.95),
    margin: `${unitVars.unit.gapPadding['000']} ${unitVars.unit.gapPadding['100']}`,
    marginBottom: '-0.4rem',
    borderBottom: `0.2rem solid transparent`,
    padding: unitVars.unit.gapPadding['200'],
    height: '100%',
  },
  variants: {
    menuType: {
      default: {},
      mypage: { flex: 1 },
    },
    state: {
      active: {
        borderBottomColor: colorVars.color.fill.primary,
        color: colorVars.color.text.primary,
        ...fontVars.font.title_sb_16,
      },
      inactive: {
        color: colorVars.color.text.tertiary,
        ...fontVars.font.title_m_16,
      },
    },
  },
  defaultVariants: {
    state: 'inactive',
  },
});

export const tabButtonText = style({
  height: '100%',
  whiteSpace: 'nowrap',
});
