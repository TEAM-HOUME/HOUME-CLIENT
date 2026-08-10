import { styleVariants } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { pressInteraction } from '@styles/tokens/interaction/presets';
import { unitVars } from '@styles/tokens/unit.css';

export const iconSize = styleVariants({
  '12': { width: '1.2rem', height: '1.2rem' },
  '14': { width: '1.4rem', height: '1.4rem' },
  '16': { width: '1.6rem', height: '1.6rem' },
  '20': { width: '2rem', height: '2rem' },
  '24': { width: '2.4rem', height: '2.4rem' },
  '32': { width: '3.2rem', height: '3.2rem' },
  '40': { width: '4rem', height: '4rem' },
});

export const iconButton = recipe({
  base: {
    transformOrigin: 'center center',
    ...pressInteraction(0.95, '&:not(:disabled):active'),
    padding: unitVars.unit.gapPadding[100],
  },
  variants: {
    disabled: {
      true: { opacity: 0.2, cursor: 'not-allowed' },
    },
    size: {
      XXS: {},
      S: {},
      M: { padding: unitVars.unit.gapPadding['200'] },
      L: {},
      XL: {},
    },
  },
});
