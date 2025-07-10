import { style, styleVariants } from '@vanilla-extract/css';
import { colorVars } from '@styles/tokens/color.css';
import { fontStyle } from '@/shared/styles/fontStyle';

export const smallButtonBase = style({
  width: '7.2rem',
  height: '3.6rem',
  padding: '1rem 1.6rem',
  textAlign: 'center',
  alignItems: 'center',
  borderRadius: '6px',
  transition: 'all 0.2s ease-in-out',
  flexShrink: 0,
});

export const smallButtonVariants = styleVariants({
  on: {
    color: colorVars.color.primary,
    backgroundColor: colorVars.color.primary_light2,
    border: `1px solid ${colorVars.color.primary}`,
    ...fontStyle('caption_m_12'),
  },
  off: {
    color: colorVars.color.gray800,
    backgroundColor: colorVars.color.gray000,
    border: `1px solid ${colorVars.color.primary_light2}`,
    ...fontStyle('caption_r_12'),
  },
});
