import { recipe } from '@vanilla-extract/recipes';

import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';

export const captionChip = recipe({
  base: {
    backgroundColor: colorVars.color.primary_light2,
    borderRadius: '3px',
    ...fontStyle('caption_m_12'),
    color: colorVars.color.primary,
    padding: '0.2rem 0.6rem',
  },
  variants: {
    stroke: {
      true: {
        outline: '1px solid black',
        outlineOffset: '-1px',
      },
    },
  },
});
