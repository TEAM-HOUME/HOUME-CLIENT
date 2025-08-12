import { style } from '@vanilla-extract/css';
import { zIndex } from '@/shared/styles/tokens/zIndex';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
});

export const buttonWrapper = style({
  bottom: '2rem',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  zIndex: zIndex.button,
});
