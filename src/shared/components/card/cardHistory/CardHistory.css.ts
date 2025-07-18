import { style } from '@vanilla-extract/css';
import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';

export const container = style({
  display: 'flex',
  width: '100%',
  minWidth: '33.5rem',
  flexDirection: 'column',
  alignItems: 'flex-start',
  borderRadius: '1.6rem',
  overflow: 'hidden',
  backgroundColor: colorVars.color.gray000,
});

export const imgbox = style({
  width: '100%',
  minWidth: '33.5rem',
  aspectRatio: '3/2',
  overflow: 'hidden',
  objectFit: 'cover', // 비율 유지하며 영역 완전히 채움
  objectPosition: 'center', // 이미지 중앙 부분 표시
});

export const image = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center',
  display: 'block',
  boxSizing: 'border-box',
});

export const textbox = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  padding: '2.4rem',
  gap: '2rem',
});

export const title = style({
  ...fontStyle('title_m_16'),
});
