import { createGlobalTheme } from '@vanilla-extract/css';

/**
 * 디자인 토큰 V2 - 색상
 *
 * 1) Primitives: 원시값만 정의 (grayscale, purple)
 * 2) Semantics: Figma color-semantic → primitive의 var() 참조
 */

const primitives = createGlobalTheme(':root', {
  color: {
    gray999: '#000000',
    gray999_a80: 'rgba(0, 0, 0, 0.8)',
    gray999_a50: 'rgba(0, 0, 0, 0.5)',
    gray999_a30: 'rgba(0, 0, 0, 0.3)',
    gray999_a10: 'rgba(0, 0, 0, 0.1)',
    gray999_a04: 'rgba(0, 0, 0, 0.04)',
    gray900: '#1B1E22',
    gray800: '#31373F',
    gray700: '#48505B',
    gray600: '#6C7789',
    gray500: '#8996A9',
    gray400: '#B7C0CD',
    gray300: '#D4DAE2',
    gray200: '#E7EAEF',
    gray100: '#F3F4F7',
    gray050: '#F9FAFB',
    gray000: '#FFFFFF',
    gray000_a80: 'rgba(255, 255, 255, 0.8)',
    gray000_a30: 'rgba(255, 255, 255, 0.3)',

    purple700: '#5000B8',
    purple600: '#6F00FF',
    purple500: '#A696FF',
    purple300: '#E8E3FC',
    purple200: '#EFEDFD',

    red700: '#ED1212',
    red600: '#FF4D4D',
  },
});

const semantics = createGlobalTheme(':root', {
  semantic: {
    bg: {
      primary: primitives.color.gray000,
    },
    border: {
      primary: primitives.color.gray300,
      secondary: primitives.color.gray200,
      tertiary: primitives.color.gray100,
      strong: primitives.color.gray900,
      weak: primitives.color.gray999_a10,
    },
    fill: {
      brand: primitives.color.purple600,
      danger: primitives.color.red600,
      dim: primitives.color.gray999_a50,
      dimSecondary: primitives.color.gray999_a30,
      disabled: primitives.color.gray300,
      inverse: primitives.color.gray000,
      inverseSecondary: primitives.color.gray000_a80,
      primary: primitives.color.gray900,
      secondary: primitives.color.gray700,
      strong: primitives.color.gray999,
      tertiary: primitives.color.gray500,
      weak: primitives.color.gray100,
    },
    shadow: {
      bottomSheet: primitives.color.gray999_a04,
    },
    text: {
      brand: primitives.color.purple600,
      danger: primitives.color.red700,
      disabled: primitives.color.gray300,
      inverse: primitives.color.gray000,
      inverseSecondary: primitives.color.gray000_a80,
      primary: primitives.color.gray900,
      secondary: primitives.color.gray700,
      tertiary: primitives.color.gray500,
    },
  },
});

/** Primitives + Semantic */
export const colorVars = {
  color: {
    ...primitives.color,
    bg: semantics.semantic.bg,
    border: semantics.semantic.border,
    fill: semantics.semantic.fill,
    shadow: semantics.semantic.shadow,
    text: semantics.semantic.text,
  },
};
