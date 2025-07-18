import { style, keyframes } from '@vanilla-extract/css';
import { colorVars } from '@styles/tokens/color.css';
import { fontStyle } from '@/shared/styles/fontStyle';

export const loadingOverlay = style({
  position: 'fixed',
  inset: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  boxSizing: 'border-box',
  zIndex: 9999,
});

export const loadingContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1.6rem',
});

const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

export const loadingSpinner = style({
  width: '4rem',
  height: '4rem',
  border: `3px solid ${colorVars.color.primary_light2}`,
  borderTop: `3px solid ${colorVars.color.primary}`,
  borderRadius: '50%',
  animation: `${spin} 1s linear infinite`,
});

export const loadingText = style({
  color: colorVars.color.primary,
  ...fontStyle('body_m_14'),
  textAlign: 'center',
});
