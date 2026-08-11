import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';

export const buttonWrapper = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
});

export const CtaButton = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.8rem',
    transition: 'all 0.2s ease-in-out',
    border: 'none',
    borderRadius: '999px',
    padding: '1.7rem 0',
    width: '100%',
    ...fontVars.font.title_m_16,
    minWidth: '12.1rem',
    height: '5.6rem',
    whiteSpace: 'nowrap',
    color: colorVars.color.gray000,
  },
  variants: {
    state: {
      active: {
        backgroundColor: colorVars.color.purple600,
        ':active': {
          backgroundColor: colorVars.color.purple700,
        },
      },
      disabled: {
        backgroundColor: colorVars.color.gray300,
        cursor: 'not-allowed',
        pointerEvents: 'none',
      },
    },
    type: {
      default: {},
      kakao: {
        backgroundColor: '#FEE500',
        padding: '1.8rem 0',
        color: '#000000D9',
        fontFamily: `"Apple SD Gothic Neo", sans-serif`,

        ':active': {
          backgroundColor: '#FEE500',
        },
      },
      notFound: {
        backgroundColor: colorVars.color.gray200,
        color: colorVars.color.gray900,

        ':active': {
          backgroundColor: colorVars.color.gray300,
        },
      },
    },
    buttonSize: {
      small: {
        height: '4rem',
      },
      medium: {
        height: '4.4rem',
      },
      large: {
        height: '5.2rem',
      },
      xlarge: {},
    },
    font: {
      default: {},
      body: {
        ...fontVars.font.body_m_14,
      },
    },
  },
  defaultVariants: {
    state: 'active',
    type: 'default',
    font: 'default',
  },
});

export const kakaoContent = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.8rem',
});

export const kakaoIcon = style({
  flexShrink: 0,
});

export const kakaoText = style({
  alignSelf: 'flex-end',
  lineHeight: 1,
});
