import { style, globalStyle } from '@vanilla-extract/css';

import { fontStyle } from '@/shared/styles/fontStyle';
import { colorVars } from '@/shared/styles/tokens/color.css';

export const container = style({
  width: '100%',
  minHeight: '100vh',
});

export const content = style({
  padding: '1.2rem 2rem',
});

export const dateText = style({
  ...fontStyle('caption_r_12'),
  color: colorVars.color.gray600,
  textAlign: 'right',
  marginBottom: '1.2rem',
});

export const policyText = style({
  ...fontStyle('caption_r_12'),
  color: colorVars.color.gray600,
  lineHeight: '1.6',
  wordBreak: 'keep-all',
});

// 제목 스타일
globalStyle(`${policyText} h1`, {
  fontSize: '1.6rem',
  fontWeight: '700',
  marginTop: '1.2rem',
  marginBottom: '0.8rem',
  color: colorVars.color.gray999,
});

globalStyle(`${policyText} h2`, {
  fontSize: '1.4rem',
  fontWeight: '600',
  marginTop: '1rem',
  marginBottom: '0.6rem',
  color: colorVars.color.gray999,
});

globalStyle(`${policyText} h3`, {
  fontSize: '1.3rem',
  fontWeight: '600',
  marginTop: '0.8rem',
  marginBottom: '0.5rem',
  color: colorVars.color.gray999,
});

// 문단 스타일
globalStyle(`${policyText} p`, {
  marginBottom: '0.6rem',
  color: colorVars.color.gray700,
});

// 리스트 스타일
globalStyle(`${policyText} ul, ${policyText} ol`, {
  marginBottom: '0.8rem',
  paddingLeft: '1.5rem',
  listStyle: 'disc', // ul은 disc
});

globalStyle(`${policyText} ol`, {
  listStyle: 'decimal', // ol은 숫자
});

globalStyle(`${policyText} li`, {
  marginBottom: '0.3rem',
  display: 'list-item', // 리스트 아이템으로 표시
});

// 테이블 스타일
globalStyle(`${policyText} table`, {
  width: '100%',
  borderCollapse: 'collapse',
  margin: '1rem 0',
  fontSize: '1.2rem',
});

globalStyle(`${policyText} th`, {
  backgroundColor: colorVars.color.gray100,
  padding: '0.8rem',
  textAlign: 'left',
  fontWeight: '600',
  border: `1px solid ${colorVars.color.gray300}`,
});

globalStyle(`${policyText} td`, {
  padding: '0.8rem',
  border: `1px solid ${colorVars.color.gray300}`,
});

// 링크 스타일
globalStyle(`${policyText} a`, {
  color: colorVars.color.primary,
  textDecoration: 'none',
});

globalStyle(`${policyText} a:hover`, {
  textDecoration: 'underline',
});

// 수평선 스타일
globalStyle(`${policyText} hr`, {
  margin: '1.2rem 0',
  border: 'none',
  borderTop: `1px solid ${colorVars.color.gray300}`,
});

// 강조 텍스트
globalStyle(`${policyText} strong`, {
  fontWeight: '700',
});
