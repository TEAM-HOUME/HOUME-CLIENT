import { createGlobalTheme } from '@vanilla-extract/css';

export const fontVars = createGlobalTheme(':root', {
  family: {
    pretendard: 'Pretendard',
  },
  // Headings
  heading_sb_24: {
    size: '2.4rem',
    weight: '600',
    lineHeight: '3.6rem',
    letterSpacing: '-0.01em',
  },
  heading_sb_22: {
    size: '2.2rem',
    weight: '600',
    lineHeight: '3.2rem',
    letterSpacing: '-0.01em',
  },
  heading_sb_20: {
    size: '2rem',
    weight: '600',
    lineHeight: '3rem',
    letterSpacing: '-0.01em',
  },
  // Title
  title_sb_18: {
    size: '1.8rem',
    weight: '400',
    lineHeight: '2.6rem',
    letterSpacing: '-0.01em',
  },
  title_m_18: {
    size: '1.8rem',
    weight: '500',
    lineHeight: '1.8rem',
    letterSpacing: '-0.01em',
  },
  title_sb_16: {
    size: '1.6rem',
    weight: '600',
    lineHeight: '1.6rem',
    letterSpacing: '-0.01em',
  },
  title_m_16: {
    size: '1.6rem',
    weight: '500',
    lineHeight: '1.6rem',
    letterSpacing: '-0.01em',
  },
  title_sb_15: {
    size: '1.5rem',
    weight: '600',
    lineHeight: '1.5rem',
    letterSpacing: '-0.01em',
  },

  // Body
  body_r_15: {
    size: '1.5rem',
    weight: '400',
    lineHeight: '1.5rem',
    letterSpacing: '-0.01em',
  },
  body_m_14: {
    size: '1.4rem',
    weight: '500',
    lineHeight: '2rem',
    letterSpacing: '-0.01em',
  },
  body_r_14: {
    size: '1.4rem',
    weight: '400',
    lineHeight: '2rem',
    letterSpacing: '-0.01em',
  },

  // Caption
  caption_m_12: {
    size: '1.2rem',
    weight: '500',
    lineHeight: '1.8rem',
    letterSpacing: '-0.01em',
  },
  caption_r_12: {
    size: '1.2rem',
    weight: '400',
    lineHeight: '1.8rem',
    letterSpacing: '-0.01em',
  },
});
