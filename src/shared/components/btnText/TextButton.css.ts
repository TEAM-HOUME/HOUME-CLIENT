import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { pressInteraction } from '@styles/tokens/interaction/presets';
import { unitVars } from '@styles/tokens/unit.css';

export const button = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: unitVars.unit.gapPadding['000'],
    transformOrigin: 'center center',
    ...pressInteraction(0.95, '&:not(:disabled):active'),
  },
  variants: {
    color: {
      primary: {
        color: colorVars.color.text.primary,
      },
      secondary: {
        // 위계 구분 표현으로 secondary 사용, 실제 폰트 컬러는 tertiary
        color: colorVars.color.text.tertiary,
      },
      inverse: {
        color: colorVars.color.text.inverse,
      },
    },
    size: {
      s: { ...fontVars.font.body_r_14 },
      m: { ...fontVars.font.title_r_15 },
    },
  },
  defaultVariants: {
    color: 'primary',
    size: 'm',
  },
});

export const iconSlot = style({
  display: 'inline-flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
});

export const textSlot = style({
  padding: `${unitVars.unit.gapPadding['000']} ${unitVars.unit.gapPadding['100']}`,
});
