import { style } from '@vanilla-extract/css';

import { fontStyle } from '@/shared/styles/fontStyle';

import { colorVars } from '@shared/styles/tokens/color.css';

export const smallButton = style({
  display: 'inline-flex',
  height: '4.4rem',
  padding: '0 2rem',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '1rem',
  borderRadius: '99.9rem',
  backgroundColor: colorVars.color.gray999,
  border: 'none',
  cursor: 'pointer',
  color: colorVars.color.gray000,
  ...fontStyle('body_m_14'),
  transition: 'all 0.2s ease',

  ':hover': {
    opacity: 0.8,
  },

  ':active': {
    transform: 'scale(0.98)',
  },
});
