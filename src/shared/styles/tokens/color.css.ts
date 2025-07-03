import { createGlobalTheme } from '@vanilla-extract/css';

export const colorVars = createGlobalTheme(':root', {
  color: {
    // Grayscale
    gray999_50: 'rgba(0, 0, 0, 0.5)',
    gray999_04: 'rgba(0, 0, 0, 0.04)',
    gray999: '#000000',
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

    // Brand Colors
    primary: '#6F00FF',
    primary_light1: '#A696FF',
    primary_light2: '#E8E3FC',
    primary_dark: '#5000B8',
    bg_grad: 'linear-gradient(180deg, #DDD6FF 0%, #FFF 50%, #FFF 100%)',
  },
});
