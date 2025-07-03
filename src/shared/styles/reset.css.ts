import { globalStyle } from '@vanilla-extract/css';

globalStyle('*', {
  margin: 0,
  padding: 0,
  boxSizing: 'border-box',
});

globalStyle('html', {
  fontSize: '62.5%',
});

// 텍스트 요소 초기화
globalStyle('h1, h2, h3, h4, h5, h6, p', {
  margin: 0,
  fontWeight: 'inherit',
  fontSize: 'inherit',
});

// 리스트 초기화
globalStyle('ul, ol', {
  margin: 0,
  padding: 0,
  listStyle: 'none',
});

// a 태그 초기화
globalStyle('a', {
  color: 'inherit',
  textDecoration: 'none',
});

// form 요소 초기화
globalStyle('button', {
  all: 'unset',
  cursor: 'pointer',
});

globalStyle('input, textarea', {
  all: 'unset',
  fontFamily: 'inherit',
});
