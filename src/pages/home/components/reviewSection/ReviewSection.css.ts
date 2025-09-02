import { style } from '@vanilla-extract/css';

import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';

export const wrapper = style({
  minWidth: '37.5rem',
  width: '100%',
});

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '3.2rem 3rem',
  gap: '2.4rem',
  backgroundColor: colorVars.color.primary_light2,
});

export const footerContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  marginBottom: '11.7rem',
  gap: '4rem',
  backgroundColor: colorVars.color.gray000,
});

export const copy = style({
  ...fontStyle('body_r_14'),
  color: colorVars.color.gray500,
  textAlign: 'center',
  padding: '4rem 0',
});
