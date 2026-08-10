import { globalStyle, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { fontStyle } from '@styles/fontStyle';
import { animationTokens } from '@styles/tokens/animation.css';
import { colorVars } from '@styles/tokensV2/color.css';

export const container = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

export const sliderArea = style({
  position: 'relative',
  width: '100%',
  height: '26rem',
  overflow: 'hidden',
});

globalStyle(`${sliderArea} .swiper`, {
  height: '100%',
});

globalStyle(`${sliderArea} .swiper-wrapper`, {
  height: '100%',
});

export const swiperSlide = style({
  position: 'relative',
  height: '100%',
  overflow: 'hidden',
});

export const listImageFrame = style({
  position: 'relative', // OptimizedImage placeholder(absolute)의 기준
  cursor: 'zoom-in',
  width: '100%',
  height: '26rem',
  overflow: 'hidden',
});

export const imgArea = recipe({
  base: {
    objectFit: 'cover',
    objectPosition: 'center center',
    width: '100%',
    height: '100%',
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

export const slideNum = style({
  position: 'absolute',
  zIndex: 1,
  top: '1.2rem',
  right: '1.2rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.1rem',
  borderRadius: '99.9rem',
  backgroundColor: colorVars.color.gray999_a30,
  width: '3.4rem',
  height: '2rem',
  ...fontStyle('caption_r_11'),
  color: colorVars.color.gray000,
});

export const slideNumSkeleton = style({
  border: `1px solid ${colorVars.color.gray200}`,
  borderRadius: 'inherit',
  boxShadow: `inset 0 0 0 1px ${colorVars.color.gray100}`,
  background: `linear-gradient(
    90deg,
    ${colorVars.color.gray200} 0%,
    ${colorVars.color.gray100} 50%,
    ${colorVars.color.gray200} 100%
  )`,
  backgroundSize: '200% 100%',
  width: '100%',
  height: '100%',
  animation: `${animationTokens.skeletonWave} 1.6s ease-in-out infinite`,
});

export const slidePrevBtn = style({
  position: 'absolute',
  zIndex: 1,
  bottom: '50%',
  left: '0.6rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  backgroundColor: 'transparent',
  padding: 0,
  width: '3.6rem',
  height: '3.6rem',
});

export const slideNextBtn = style({
  position: 'absolute',
  zIndex: 1,
  right: '0.6rem',
  bottom: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  backgroundColor: 'transparent',
  padding: 0,
  width: '3.6rem',
  height: '3.6rem',
});

export const slideNavIconFrame = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '1.2rem',
  backgroundColor: colorVars.color.gray999_a30,
  width: '2.4rem',
  height: '2.4rem',

  selectors: {
    [`${slidePrevBtn}:active &`]: {
      backgroundColor: colorVars.color.gray999_a50,
    },
    [`${slideNextBtn}:active &`]: {
      backgroundColor: colorVars.color.gray999_a50,
    },
    [`${slidePrevBtn}:disabled &`]: {
      backgroundColor: colorVars.color.gray999_a04,
    },
    [`${slideNextBtn}:disabled &`]: {
      backgroundColor: colorVars.color.gray999_a04,
    },
  },
});

globalStyle(`${slideNavIconFrame} > svg`, {
  width: '1.2rem',
  height: '1.2rem',
});

export const imgAreaBlurred = recipe({
  base: {
    filter: 'blur(15px)',
    backgroundColor: 'lightgray',
    objectFit: 'cover',
    objectPosition: 'center center',
    width: '100%',
    height: '100%',
  },
  variants: {
    mirrored: {
      true: {
        transform: 'scaleX(-1) scale(1.1)',
      },
      false: {
        transform: 'scale(1.1)',
      },
    },
  },
  defaultVariants: {
    mirrored: false,
  },
});

export const lockedPreviewImg = style({
  objectFit: 'cover',
  objectPosition: 'center center',
  width: '100%',
  height: '100%',
});

export const lockWrapper = style({
  position: 'absolute',
  zIndex: 1,
  top: '50%',
  left: '50%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '2rem',
  transform: 'translate(-50%, -50%)',
  width: '23.2rem',
});

export const lockTextBox = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  color: colorVars.color.gray900,
  ...fontStyle('body_m_14'),
});

globalStyle(`${lockTextBox} p`, {
  margin: 0,
});

export const moreBtn = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '99.9rem',
  backgroundColor: colorVars.color.gray999,
  width: '11.6rem',
  height: '4.4rem',
  ...fontStyle('body_m_14'),
  color: colorVars.color.gray000,
});

export const feedbackSection = style({
  marginTop: '2rem',
  padding: '0 2rem',
});

export const feedbackBox = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  borderRadius: '1.2rem',
  backgroundColor: colorVars.color.gray100,
  padding: '1.6rem clamp(1.6rem, 4vw, 4rem)',
});

export const feedbackTitle = style({
  margin: 0,
  ...fontStyle('body_m_14'),
  color: colorVars.color.gray900,
});

export const feedbackButtonGroup = style({
  display: 'flex',
  gap: '0.6rem',
});

export const feedbackTagGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.8rem',
});

export const feedbackTagRow = style({
  display: 'flex',
  gap: '0.6rem',
});

export const feedbackTagButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '99.9rem',
  backgroundColor: colorVars.color.gray000,
  padding: '0 1.6rem',
  ...fontStyle('body_r_14'),
  height: '3.6rem',
  color: colorVars.color.gray700,

  ':active': {
    backgroundColor: colorVars.color.gray300,
  },

  ':disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
});

export const feedbackTagButtonSelected = style({
  backgroundColor: colorVars.color.gray000,
  color: colorVars.color.purple600,
});
