import { style } from '@vanilla-extract/css';
import { colorVars } from '@styles/tokens/color.css';
import { fontStyle } from '@/shared/styles/fontStyle';

export const buttonWrapper = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '37.5rem',
  height: '4.4rem',
  padding: '0.4rem 2rem',
  backgroundColor: colorVars.color.gray000,
});

export const textContainer = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.8rem',
});

export const messageText = style({
  ...fontStyle('body_m_14'),
  color: colorVars.color.gray600,
  padding: '0.4rem 0',
  whiteSpace: 'pre-line',
});
