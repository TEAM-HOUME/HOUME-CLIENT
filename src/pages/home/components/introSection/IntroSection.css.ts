import { style, keyframes } from '@vanilla-extract/css';
import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';

const fadeInUp = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translateY(1rem)',
  },
  '100%': {
    opacity: 1,
    transform: 'translateY(0)',
  },
});

export const wrapper = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  textAlign: 'center',
  gap: '1.5rem',
  alignSelf: 'stretch',
});

export const titleWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  animation: `${fadeInUp} 1.2s ease-out forwards`,
});

export const title = style({
  ...fontStyle('heading_sb_20'),
  color: colorVars.color.gray900,
  textAlign: 'left',
  marginBottom: '0.8rem',
});

export const description = style({
  ...fontStyle('body_r_14'),
  color: colorVars.color.gray600,
  textAlign: 'left',
  marginBottom: '4rem',
});

export const placeholderBox = style({
  width: '100%',
  height: '22rem',
  backgroundColor: colorVars.color.gray100,
  borderRadius: '16px',
  animation: `${fadeInUp} 1.2s ease-out forwards`,
});

export const buttonGroup = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '0.7rem',
  marginTop: '1.6rem',
  width: '100%',
});

export const radioButtonLabel = style({
  display: 'inline-block',
});

export const radioButton = style({
  display: 'none',
});
