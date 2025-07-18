import { recipe } from '@vanilla-extract/recipes';
import { colorVars } from '@styles/tokens/color.css';
import { style } from '@vanilla-extract/css';
import { fontStyle } from '@/shared/styles/fontStyle';

export const buttonWrapper = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
});

export const CtaButton = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minWidth: '12.1rem',
    maxWidth: '37.1rem',
    height: '5.6rem',
    padding: '1.7rem 0',
    gap: '0.8rem',
    borderRadius: '999px',
    ...fontStyle('title_m_16'),
    color: colorVars.color.gray000,
    transition: 'all 0.2s ease-in-out',
    border: 'none',
    whiteSpace: 'nowrap',
  },
  variants: {
    state: {
      active: {
        backgroundColor: colorVars.color.primary,
        ':active': {
          backgroundColor: colorVars.color.primary_dark,
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
        fontFamily: `"Apple SD Gothic Neo", sans-serif`,
        backgroundColor: '#FEE500',
        color: '#000000D9',
        padding: '1.8rem 0',

        ':active': {
          backgroundColor: '#FEE500',
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
        ...fontStyle('body_m_14'),
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
  lineHeight: 1,
  alignSelf: 'flex-end',
});
