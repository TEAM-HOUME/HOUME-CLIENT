import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { fontStyle } from '@/shared/styles/fontStyle';
import { animationTokens } from '@/shared/styles/tokens/animation.css';

import { colorVars } from '@styles/tokens/color.css';

export const wrapper = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minHeight: '66.7rem',
  width: '100%',
});

export const resultSection = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
});

export const imgArea = recipe({
  base: {
    width: '100%',
    aspectRatio: '3 / 2',
    objectFit: 'cover', // 비율 유지하며 영역 완전히 채움
    objectPosition: 'center', // 이미지 중앙 부분 표시
    animation: animationTokens.fadeInUpFast,
  },
  variants: {
    mirrored: {
      true: {
        transform: 'scaleX(-1)',
      },
      false: {
        transform: 'none',
      },
    },
  },
  defaultVariants: {
    mirrored: false,
  },
});

export const buttonSection = style({
  padding: '2rem',
  width: '100%',
});

export const buttonSectionDisabled = style({
  opacity: 0.3,
  pointerEvents: 'none',
});

export const buttonBox = style({
  display: 'flex',
  flexDirection: 'column',
  padding: '1.6rem clamp(1.6rem, 4vw, 4rem)',
  width: '100%',
  height: '100%',
  borderRadius: '1.2rem',
  justifyContent: 'center',
  gap: '1rem',
  backgroundColor: colorVars.color.gray100,
});

export const boxText = style({
  ...fontStyle('body_m_14'),
  color: colorVars.color.gray900,
});

export const buttonGroup = style({
  display: 'flex',
  gap: '0.6rem',
});

export const tagGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.8rem',
});

export const tagFlexItem = style({
  display: 'flex',
  gap: '0.6rem',
});

export const tagButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '99.9rem',
  height: '3.6rem',
  padding: '0 1.6rem',
  ...fontStyle('body_r_14'),
  cursor: 'pointer',
  backgroundColor: colorVars.color.gray000,
  color: colorVars.color.gray700,

  ':active': {
    backgroundColor: colorVars.color.gray300,
  },
});

export const tagButtonSelected = style({
  backgroundColor: colorVars.color.gray000,
  color: colorVars.color.primary,
});
