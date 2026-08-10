import { style } from '@vanilla-extract/css';

import { fontStyle } from '@styles/fontStyle';
import { colorVars } from '@styles/tokens/color.css';

export const contentWrapper = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center', // 콘텐츠 에러 영역에만 에러를 표시함(모든 페이지를 차지하지 않음)
  gap: '2rem',
  padding: '4rem 2rem',
  width: '100%',
});

export const textSection = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.8rem',
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
  width: '100%',
});

export const buttonSection = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 2rem',
  width: '100%',
});
