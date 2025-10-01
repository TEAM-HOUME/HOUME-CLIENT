import { recipe } from '@vanilla-extract/recipes';

import { fontStyle } from '@/shared/styles/fontStyle';

import { colorVars } from '@styles/tokens/color.css';

export const curationButton = recipe({
  base: {
    display: 'flex',
    width: '16.4rem',
    height: '3rem',
    padding: '0.8rem 0.4rem',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: '99.9rem',
    border: `1px solid ${colorVars.color.gray300}`,
    backgroundColor: colorVars.color.gray000,
    cursor: 'pointer',
    ...fontStyle('caption_r_12'),
    color: colorVars.color.gray700,
  },
});

export const curationButtonText = {
  display: 'flex',
  padding: '0 0.8rem',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '0.4rem',
};

export const curationButtonIcon = {
  width: '2.4rem',
  height: '2.4rem',
  padding: '0.6rem',
  flexShrink: 0,
  justifyContent: 'center',
  alignItems: 'center',
  color: colorVars.color.gray500,
};
