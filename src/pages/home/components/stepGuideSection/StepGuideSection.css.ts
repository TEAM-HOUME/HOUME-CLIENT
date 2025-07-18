import { style } from '@vanilla-extract/css';
import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';

export const wrapper = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'stretch',
  width: '100%',
});

export const landingImage = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.8rem',
  marginTop: '2.5rem',
  marginBottom: '4rem',
  alignItems: 'center',
});

export const landingImageImg = style({
  width: '37.5rem',
  objectFit: 'cover',
});

export const headingText = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.4rem',
  width: '100%',
  height: '6rem',
  textAlign: 'center',
  ...fontStyle('heading_sb_18'),
});

export const stepLandImage = style({
  width: '37.5rem',
  height: '22rem',
  backgroundColor: colorVars.color.gray100,
  marginBottom: '4rem',
  objectFit: 'cover',
});

export const imageGap = style({
  marginTop: '2rem',
});

export const resultLandImage = style({
  width: '37.5rem',
  height: '24rem',
  backgroundColor: colorVars.color.gray100,
  marginBottom: '4rem',
  objectFit: 'cover',
});
