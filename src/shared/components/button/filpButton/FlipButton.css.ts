import { style, styleVariants } from '@vanilla-extract/css';
import { colorVars } from '@styles/tokens/color.css';

export const flipButtonBase = style({
  width: '8rem',
  height: '5.6rem',
  padding: '1.2rem 0',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '0.8rem',
  borderRadius: '99.9rem',
  transition: 'all 0.2s ease-in-out',
  border: 'none',
  flexShrink: 0,
});

export const flipButtonVariants = styleVariants({
  normal: {
    backgroundColor: colorVars.color.primary_light2,
  },
  clicked: {
    backgroundColor: colorVars.color.primary_light1,
  },
});
