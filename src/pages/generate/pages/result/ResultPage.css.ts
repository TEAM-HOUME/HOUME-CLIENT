import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { fontStyle } from '@/shared/styles/fontStyle';
import { animationTokens } from '@/shared/styles/tokens/animation.css';
import { zIndex } from '@/shared/styles/tokens/zIndex';

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

export const buttonBox = style({
  display: 'flex',
  flexDirection: 'column',
  padding: '1.6rem',
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
  gap: '1.1rem',
  justifyContent: 'center',
});

// export const curationSection = style({
//   display: 'flex',
//   flexDirection: 'column',
//   paddingTop: '4rem',
//   backgroundColor: colorVars.color.gray100,
//   width: '100%',
// });

// export const textContainer = style({
//   display: 'flex',
//   flexDirection: 'column',
//   gap: '0.8rem',
//   textAlign: 'center',
// });

// export const headerText = style({
//   ...fontStyle('heading_sb_18'),
//   color: colorVars.color.gray900,
// });

// export const bodyText = style({
//   ...fontStyle('body_r_14'),
//   color: colorVars.color.gray600,
// });

// export const premiumContentSection = style({
//   position: 'relative',
//   width: '100%',
//   display: 'flex',
//   justifyContent: 'center',
//   alignItems: 'center',
// });

// export const unlockSection = style({
//   position: 'absolute',
//   top: '42%',
//   left: '50%',
//   transform: 'translate(-50%, -50%)',
//   zIndex: zIndex.blurButton,
//   width: '12.1rem',
//   height: '4rem',
//   display: 'flex',
//   flexDirection: 'column',
//   alignItems: 'center',
//   gap: '1.2rem',
// });
