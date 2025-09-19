import { style } from '@vanilla-extract/css';

import { fontStyle } from '@/shared/styles/fontStyle';
import { zIndex } from '@/shared/styles/tokens/zIndex';

import { colorVars } from '@styles/tokens/color.css';

export const filterSection = style({
  display: 'flex',
  gap: '0.4rem',
  padding: '0.8rem 0',
  alignItems: 'center',
  width: '100%',
  minWidth: '34.3rem',
  backgroundColor: colorVars.color.gray000,

  position: 'sticky',
  top: 0,
  zIndex: zIndex.sticky,

  overflowX: 'auto',
  whiteSpace: 'nowrap',

  '::-webkit-scrollbar': {
    display: 'none',
  },
  scrollbarWidth: 'none', // Firefox
  msOverflowStyle: 'none', // IE and Edge
});

export const scrollContentArea = style({
  overflowY: 'auto',
  maxHeight: '48.7rem',

  '::-webkit-scrollbar': {
    display: 'none',
  },
  scrollbarWidth: 'none', // Firefox
  msOverflowStyle: 'none', // IE and Edge
});

export const headerText = style({
  ...fontStyle('title_m_16'),
  color: colorVars.color.gray900,
  marginTop: '0.8rem',
});

export const curationSection = style({
  display: 'flex',
  gap: '1.2rem',
  marginTop: '1.6rem',
});

export const wrapper = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
});

export const container = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

export const gridbox = style({
  width: '100%',
  height: 'fit-content',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(16.6rem, 1fr))',
  columnGap: '1.1rem',
  justifyContent: 'center',
});
