import { style } from '@vanilla-extract/css';
import { colorVars } from '@/shared/styles/tokens/color.css';

export const wrapper = style({
  width: '3.5rem',
  height: '0.4rem',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: colorVars.color.gray300,
});
