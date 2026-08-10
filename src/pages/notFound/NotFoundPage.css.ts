import { style } from '@vanilla-extract/css';

import { fontStyle } from '@styles/fontStyle';
import { colorVars } from '@styles/tokens/color.css';

export const contentWrapper = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingTop: '4rem',
  width: '100%',
  height: '100dvh',
});

export const textSection = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.8rem',
  padding: '4rem 2rem',
  width: '100%',
});

export const headerText = style({
  ...fontStyle('heading_sb_20'),
});

export const bodyText = style({
  ...fontStyle('body_r_14'),
  textAlign: 'center',
  color: colorVars.color.gray600,
});

export const imgSection = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '2rem',
  width: '100%',
});

export const buttonSection = style({
  position: 'absolute',
  bottom: '0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  width: '100%',
});
