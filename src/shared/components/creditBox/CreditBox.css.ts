import { style } from '@vanilla-extract/css';
import { colorVars } from '@styles/tokens/color.css';
import { fontStyle } from '@/shared/styles/fontStyle';

export const boxWrapper = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1.8rem',
  backgroundColor: colorVars.color.gray100,
  height: '4rem',
  padding: '0rem 0.8rem 0rem 1.6rem',
  maxWidth: '100%',
  borderRadius: '0.6rem',
  flexShrink: 0,
});

export const contentWrapper = style({
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  width: '100%',
  gap: '1.8rem',
});

export const textContainer = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: '0.8rem',
});

export const infoText = style({
  ...fontStyle('body_m_14'),
  color: colorVars.color.gray600,
});

export const creditText = style({
  ...fontStyle('title_sb_16'),
  color: colorVars.color.gray900,
  transform: 'translateY(0.1rem)',
});
