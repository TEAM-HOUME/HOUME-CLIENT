import { style } from '@vanilla-extract/css';
import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';

export const wrapper = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  textAlign: 'center',
  alignSelf: 'stretch',
});

export const titleWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
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

export const radioImageBox = style({
  width: '100%',
  height: '22.3rem',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

export const radioImage = style({
  width: '33.5rem',
  borderRadius: '16px',
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
  width: '100%',
});

export const radioButton = style({
  display: 'none',
});
