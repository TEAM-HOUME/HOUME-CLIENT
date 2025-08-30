import { style } from '@vanilla-extract/css';
import { zIndex } from '@/shared/styles/tokens/zIndex';

export const container = style({
  display: 'flex',
  position: 'relative',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  marginBottom: '9.6rem',
});

export const buttonWrapper = style({
  position: 'fixed',
  bottom: '2rem',
  width: '100%',
  maxWidth: '44rem', // CtaButton 최대 너비 설정
  display: 'flex',
  justifyContent: 'center',
  zIndex: zIndex.button,
  padding: '0 2rem 0 2rem',
  left: 0,
  right: 0,
  margin: '0 auto',
});
