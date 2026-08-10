import { createGlobalTheme } from '@vanilla-extract/css';

/**
 * 디자인 토큰 V2 - Unit (dimension, gap/padding, radius)
 *
 * Figma Design Token - unit 스코프
 * 값 단위: rem
 */
export const unitVars = createGlobalTheme(':root', {
  unit: {
    // dimension - WIDTH_HEIGHT
    dimension: {
      hMax: '95.6rem',
      hMin: '66.7rem',
      wMax: '44rem',
      wMin: '37.5rem',
    },

    // gap, padding - GAP
    gapPadding: {
      '000': '0rem',
      '050': '0.2rem',
      '100': '0.4rem',
      '200': '0.8rem',
      '300': '1.2rem',
      '400': '1.6rem',
      '500': '2rem',
      '600': '2.4rem',
      '700': '3.2rem',
      '800': '4rem',
      '900': '5.6rem',
      full: '9999rem',
    },

    // radius - CORNER_RADIUS
    radius: {
      '000': '0rem',
      '100': '0.4rem',
      '200': '0.8rem',
      '300': '1.2rem',
      '400': '1.6rem',
      '500': '2rem',
      '600': '2.4rem',
      '700': '3.2rem',
      '800': '4rem',
      full: '9999rem',
    },
  },
});
