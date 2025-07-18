import { recipe } from '@vanilla-extract/recipes';
import { colorVars } from '@styles/tokens/color.css';
import { fontStyle } from '@/shared/styles/fontStyle';

export const chargeButton = recipe({
  base: {
    height: '2.8rem',
    padding: '0rem 1.2rem',
    alignItems: 'center',
    gap: '0.8rem',
    borderRadius: '999px',
    ...fontStyle('caption_m_12'),
    color: colorVars.color.primary,
    transition: 'all 0.2s ease-in-out',
    border: 'none',
  },
  variants: {
    state: {
      active: {
        backgroundColor: colorVars.color.primary_light2,
        ':active': {
          backgroundColor: colorVars.color.primary_light1,
        },
      },
      disabled: {
        backgroundColor: colorVars.color.gray300,
        color: colorVars.color.gray000,
        cursor: 'not-allowed',
      },
    },
  },
  defaultVariants: {
    state: 'active',
  },
});
