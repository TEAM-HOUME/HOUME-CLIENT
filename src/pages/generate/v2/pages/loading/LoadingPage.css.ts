import { style } from '@vanilla-extract/css';

import { animationTokens } from '@styles/tokensV2/animation.css';

import { colorVars } from '@/shared/styles/tokensV2/color.css';
import { fontVars } from '@/shared/styles/tokensV2/font.css';
import { unitVars } from '@/shared/styles/tokensV2/unit.css';

export const pageLayout = style({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100dvh',
});

export const wrapper = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${unitVars.unit.gapPadding['000']} ${unitVars.unit.gapPadding['500']} ${unitVars.unit.gapPadding['800']}`,
  animation: animationTokens.fadeInUpFast,
});

export const carouselSection = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: unitVars.unit.gapPadding['600'],
  width: '100%',
});

export const buttonGroup = style({
  display: 'flex',
  justifyContent: 'center',
  gap: unitVars.unit.gapPadding['500'],
  padding: unitVars.unit.gapPadding['500'],
  width: '100%',
});

// 이미지 영역 컨테이너
export const imageContainer = style({
  aspectRatio: '1 / 1',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minWidth: '33.5rem',
  height: 'auto',
});

// 현재 이미지 영역
export const currentImageArea = style({
  aspectRatio: '1 / 1',
  position: 'absolute',
  transform: 'translateY(0)',
  transition: 'transform 0.6s ease, opacity 0.6s ease',
  opacity: 1,
  width: '100%',
  minWidth: '33.5rem',
  overflow: 'hidden',
});

export const currentImageAreaOut = style({
  transform: 'translateY(-20px)',
  opacity: 0,
});

// 다음 이미지 영역
export const nextImageArea = style({
  aspectRatio: '1 / 1',
  position: 'absolute',
  transform: 'translateY(30px)',
  transition: 'transform 0.6s ease, opacity 0.6s ease',
  opacity: 0,
  borderRadius: unitVars.unit.radius['700'],
  width: '91%',
  minWidth: '30.5rem',
  overflow: 'hidden',
});

export const nextImageAreaActive = style({
  aspectRatio: '1 / 1',
  transform: 'translateY(0)',
  opacity: 1,
  width: '100%',
  minWidth: '33.5rem',
});

// 이미지 스타일
export const imageStyle = style({
  borderRadius: unitVars.unit.radius['700'],
  objectFit: 'cover',
  width: '100%',
  height: '100%',
});

// 에러 메시지 스타일
export const errorMessage = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  ...fontVars.font.body_r_14,
  textAlign: 'center',
  color: colorVars.color.gray600,
});

// 이탈 방지 팝업 콘텐츠 영역
export const popupContent = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

export const popupTitle = style({
  ...fontVars.font.title_sb_16,
  marginBottom: unitVars.unit.gapPadding['200'],
  textAlign: 'center',
  color: colorVars.color.text.primary,
});

export const popupDetail = style({
  ...fontVars.font.body_r_14,
  textAlign: 'center',
  color: colorVars.color.text.secondary,
});
