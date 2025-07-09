import { style } from '@vanilla-extract/css';

export const wrapper = style({
  display: 'flex',
  flexDirection: 'column',
  width: '20rem',
  height: '0.4rem',
  alignItems: 'flex-start',
  gap: '1rem',
  flexShrink: 0,
});

export const row = style({
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
});
