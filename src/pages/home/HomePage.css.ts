import { style } from '@vanilla-extract/css';
import { colorVars } from '@/shared/styles/tokens/color.css';
import { zIndex } from '@/shared/styles/tokens/zIndex';

export const page = style({
  background: colorVars.color.bg_grad,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
});

export const gradFrame = style({
  width: '100%',
  background:
    'linear-gradient(180deg, #A696FF -15.93%, #DDD6FF 13.05%, #FFF 47.05%, #FFF 100%)',
  height: '55.65rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

export const introSection = style({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '1.6rem 2rem 0 2rem',
});

export const contents = style({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  alignItems: 'center',
  background: colorVars.color.gray000,
});

export const buttonContainer = style({
  width: '100%',
  maxWidth: '44rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'fixed',
  bottom: '0',
  zIndex: zIndex.button,
  marginTop: '4rem',
  padding: '0rem 2rem 2rem 2rem',
});
