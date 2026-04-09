import { style } from '@vanilla-extract/css';

export const contentWrapper = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  alignItems: 'center',
  alignSelf: 'stretch',
  minHeight: '100vh',
});

export const menuTabContainer = style({
  alignSelf: 'stretch',
  width: '100%',
});
