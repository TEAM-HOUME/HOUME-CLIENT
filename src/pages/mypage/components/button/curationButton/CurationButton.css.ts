import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { fontStyle } from '@/shared/styles/fontStyle';

import { colorVars } from '@styles/tokens/color.css';

export const curationButton = recipe({
  base: {
    display: 'flex',
    width: '100%',
    height: '3rem',
    padding: '0.8rem 0.4rem',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: '999px',
    border: `1px solid ${colorVars.color.gray300}`,
    backgroundColor: colorVars.color.gray000,
    cursor: 'pointer',
    ...fontStyle('caption_r_12'),
    color: colorVars.color.gray700,
  },
});

export const curationButtonText = style({
  display: 'flex',
  padding: '0 0.8rem',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '0.4rem',
});

export const curationButtonIcon = style({
  display: 'flex',
  width: '2.4rem',
  height: '2.4rem',
  padding: '0.6rem',
  justifyContent: 'center',
  alignItems: 'center',
  flexShrink: 0,
  color: colorVars.color.gray500,
});
