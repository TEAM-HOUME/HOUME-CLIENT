import { createGlobalTheme } from '@vanilla-extract/css';

export const fontVars = createGlobalTheme(':root', {
  family: {
    pretendard: 'Pretendard',
  },
  // Headings
  heading_sb_20: {
    size: '2rem',
    weight: '600',
    lineHeight: '150%',
    letterSpacing: '-0.01em',
  },
  heading_sb_18: {
    size: '1.8rem',
    weight: '600',
    lineHeight: '150%',
    letterSpacing: '-0.01em',
  },
  // Title
  title_sb_16: {
    size: '1.6rem',
    weight: '600',
    lineHeight: '100%',
    letterSpacing: '-0.01em',
  },
  title_m_16: {
    size: '1.6rem',
    weight: '500',
    lineHeight: '100%',
    letterSpacing: '-0.01em',
  },
  title_r_16: {
    size: '1.6rem',
    weight: '400',
    lineHeight: '100%',
    letterSpacing: '-0.01em',
  },
  title_sb_15: {
    size: '1.5rem',
    weight: '600',
    lineHeight: '100%',
    letterSpacing: '-0.01em',
  },

  // Body
  body_m_14: {
    size: '1.4rem',
    weight: '500',
    lineHeight: '150%',
    letterSpacing: '-0.01em',
  },
  body_r_14: {
    size: '1.4rem',
    weight: '400',
    lineHeight: '150%',
    letterSpacing: '-0.01em',
  },
  body_r_13: {
    size: '1.3rem',
    weight: '400',
    lineHeight: '140%',
    letterSpacing: '-0.01em',
  },

  // Caption
  caption_sb_12: {
    size: '1.2rem',
    weight: '600',
    lineHeight: '150%',
    letterSpacing: '-0.01em',
  },
  caption_m_12: {
    size: '1.2rem',
    weight: '500',
    lineHeight: '150%',
    letterSpacing: '-0.01em',
  },
  caption_r_12: {
    size: '1.2rem',
    weight: '400',
    lineHeight: '150%',
    letterSpacing: '-0.01em',
  },
  caption_r_11: {
    size: '1.1rem',
    weight: '400',
    lineHeight: '100%',
    letterSpacing: '-0.01em',
  },
});
