import { createGlobalTheme } from '@vanilla-extract/css';

const LS = '-0.02em'; // Letter spacing -2%

/**
 * 디자인 토큰 V2 - 폰트(타이포)
 *
 * 1) Primitives: Figma typo-primitive (font, size, weight) — 원시값만
 * 2) Semantic: 역할별 토큰 (title_sb_16, body_m_14 등) — primitive 참조
 */

const primitives = createGlobalTheme(':root', {
  typoPrimitive: {
    font: {
      pretendard: 'Pretendard',
    },
    size: {
      11: '1.1rem',
      12: '1.2rem',
      13: '1.3rem',
      14: '1.4rem',
      15: '1.5rem',
      16: '1.6rem',
      18: '1.8rem',
      20: '2rem',
      24: '2.4rem',
    },
    weight: {
      400: '400',
      500: '500',
      600: '600',
      700: '700',
    },
  },
});

const semantic = createGlobalTheme(':root', {
  font: {
    family: {
      pretendard: primitives.typoPrimitive.font.pretendard,
    },

    // Title (150%)
    title_sb_24: {
      fontFamily: primitives.typoPrimitive.font.pretendard,
      fontSize: primitives.typoPrimitive.size[24],
      fontWeight: primitives.typoPrimitive.weight[600],
      lineHeight: '150%',
      letterSpacing: LS,
    },
    title_sb_20: {
      fontFamily: primitives.typoPrimitive.font.pretendard,
      fontSize: primitives.typoPrimitive.size[20],
      fontWeight: primitives.typoPrimitive.weight[600],
      lineHeight: '150%',
      letterSpacing: LS,
    },
    title_sb_18: {
      fontFamily: primitives.typoPrimitive.font.pretendard,
      fontSize: primitives.typoPrimitive.size[18],
      fontWeight: primitives.typoPrimitive.weight[600],
      lineHeight: '150%',
      letterSpacing: LS,
    },
    title_sb_16: {
      fontFamily: primitives.typoPrimitive.font.pretendard,
      fontSize: primitives.typoPrimitive.size[16],
      fontWeight: primitives.typoPrimitive.weight[600],
      lineHeight: '150%',
      letterSpacing: LS,
    },
    title_m_16: {
      fontFamily: primitives.typoPrimitive.font.pretendard,
      fontSize: primitives.typoPrimitive.size[16],
      fontWeight: primitives.typoPrimitive.weight[500],
      lineHeight: '150%',
      letterSpacing: LS,
    },
    title_sb_15: {
      fontFamily: primitives.typoPrimitive.font.pretendard,
      fontSize: primitives.typoPrimitive.size[15],
      fontWeight: primitives.typoPrimitive.weight[600],
      lineHeight: '150%',
      letterSpacing: LS,
    },
    title_m_15: {
      fontFamily: primitives.typoPrimitive.font.pretendard,
      fontSize: primitives.typoPrimitive.size[15],
      fontWeight: primitives.typoPrimitive.weight[500],
      lineHeight: '150%',
      letterSpacing: LS,
    },
    title_r_15: {
      fontFamily: primitives.typoPrimitive.font.pretendard,
      fontSize: primitives.typoPrimitive.size[15],
      fontWeight: primitives.typoPrimitive.weight[400],
      lineHeight: '150%',
      letterSpacing: LS,
    },
    title_sb_14: {
      fontFamily: primitives.typoPrimitive.font.pretendard,
      fontSize: primitives.typoPrimitive.size[14],
      fontWeight: primitives.typoPrimitive.weight[600],
      lineHeight: '150%',
      letterSpacing: LS,
    },

    // Body (150%)
    body_m_14: {
      fontFamily: primitives.typoPrimitive.font.pretendard,
      fontSize: primitives.typoPrimitive.size[14],
      fontWeight: primitives.typoPrimitive.weight[500],
      lineHeight: '150%',
      letterSpacing: LS,
    },
    body_r_14: {
      fontFamily: primitives.typoPrimitive.font.pretendard,
      fontSize: primitives.typoPrimitive.size[14],
      fontWeight: primitives.typoPrimitive.weight[400],
      lineHeight: '150%',
      letterSpacing: LS,
    },
    body_m_13: {
      fontFamily: primitives.typoPrimitive.font.pretendard,
      fontSize: primitives.typoPrimitive.size[13],
      fontWeight: primitives.typoPrimitive.weight[500],
      lineHeight: '150%',
      letterSpacing: LS,
    },
    body_r_13: {
      fontFamily: primitives.typoPrimitive.font.pretendard,
      fontSize: primitives.typoPrimitive.size[13],
      fontWeight: primitives.typoPrimitive.weight[400],
      lineHeight: '150%',
      letterSpacing: LS,
    },

    // Caption (130%)
    caption_m_12: {
      fontFamily: primitives.typoPrimitive.font.pretendard,
      fontSize: primitives.typoPrimitive.size[12],
      fontWeight: primitives.typoPrimitive.weight[500],
      lineHeight: '130%',
      letterSpacing: LS,
    },
    caption_r_12: {
      fontFamily: primitives.typoPrimitive.font.pretendard,
      fontSize: primitives.typoPrimitive.size[12],
      fontWeight: primitives.typoPrimitive.weight[400],
      lineHeight: '130%',
      letterSpacing: LS,
    },
    caption_r_11: {
      fontFamily: primitives.typoPrimitive.font.pretendard,
      fontSize: primitives.typoPrimitive.size[11],
      fontWeight: primitives.typoPrimitive.weight[400],
      lineHeight: '130%',
      letterSpacing: LS,
    },
  },
});

/** Primitives + Semantic */
export const fontVars = {
  font: {
    ...semantic.font,
    size: primitives.typoPrimitive.size,
    weight: primitives.typoPrimitive.weight,
  },
};
