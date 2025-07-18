// Caption.css.ts
import { style, styleVariants } from '@vanilla-extract/css';
import { colorVars } from '@/shared/styles/tokens/color.css';
import { fontStyle } from '@/shared/styles/fontStyle';

export const captionBox = style({
  display: 'flex',
  alignItems: 'center',
  padding: '0.8rem 1.2rem',
  borderRadius: '6px',
  backgroundColor: colorVars.color.gray000,
  outline: `1px solid ${colorVars.color.gray300}`,
  outlineOffset: '-1px',
  boxSizing: 'border-box',
  width: '100%',
});

export const textVariants = styleVariants({
  strong: {
    ...fontStyle('caption_sb_12'),
    color: colorVars.color.gray900,
    marginRight: '0.1rem',
  },
  normal: {
    ...fontStyle('caption_r_12'),
    color: colorVars.color.gray500,
    marginRight: '0.4rem', // 기본 간격 4px
  },
  normalSmall: {
    ...fontStyle('caption_r_12'),
    color: colorVars.color.gray500,
    marginLeft: '0.1rem',
  },
  highlight: {
    ...fontStyle('caption_m_12'),
    color: colorVars.color.gray000,
    backgroundColor: colorVars.color.gray800,
    padding: '0 0.4rem',
    borderRadius: '3px',
  },
});
