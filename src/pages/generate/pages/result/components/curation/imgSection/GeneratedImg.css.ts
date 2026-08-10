import { globalStyle, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { fontStyle } from '@styles/fontStyle';
import { colorVars } from '@styles/tokens/color.css';
import { unitVars } from '@styles/tokens/unit.css';

export const container = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

export const sliderArea = style({
  aspectRatio: '37.5 / 26',
  position: 'relative',
  margin: '0 auto',
  width: '100%',
  maxWidth: unitVars.unit.dimension.wMax,
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

export const zoomTrigger = style({
  position: 'relative',
  cursor: 'zoom-in',
  width: '100%',
  height: '100%',
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

export const slideNavBtnWrap = style({
  position: 'absolute',
  zIndex: 1,
  top: '50%',
  transform: 'translateY(-50%)',
});

export const slidePrevBtnWrap = style([
  slideNavBtnWrap,
  {
    left: unitVars.unit.gapPadding['100'],
  },
]);

export const slideNextBtnWrap = style([
  slideNavBtnWrap,
  {
    right: unitVars.unit.gapPadding['100'],
  },
]);

export const slideNavBtn = style({
  padding: unitVars.unit.gapPadding['200'],
});

export const lockedPreviewImg = style({
  objectFit: 'cover',
  objectPosition: 'center center',
  width: '100%',
  height: '100%',
});

export const lockWrapper = style({
  position: 'absolute',
  top: '50%',
  left: '50%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: unitVars.unit.gapPadding['500'],
  transform: 'translate(-50%, -50%)',
  width: '100%',
});

export const lockTextBox = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  color: colorVars.color.text.primary,
  ...fontStyle('body_m_14'),
});

globalStyle(`${lockTextBox} p`, {
  margin: 0,
});
