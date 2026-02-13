import { style } from '@vanilla-extract/css';

import { fontStyle } from '@/shared/styles/fontStyle';
import { animationTokens } from '@/shared/styles/tokens/animation.css';

import { colorVars } from '@styles/tokens/color.css';

// 스켈레톤 공통 shimmer 블록
const skeletonBlock = {
  backgroundColor: colorVars.color.gray100,
  borderRadius: '0.2rem',
  background: `linear-gradient(
    90deg,
    ${colorVars.color.gray100} 0%,
    ${colorVars.color.gray050} 50%,
    ${colorVars.color.gray100} 100%
  )`,
  backgroundSize: '200% 100%',
  animation: `${animationTokens.skeletonWave} 1.6s ease-in-out infinite`,
} as const;

// ─── 이미지 영역 ───
export const imgContainer = style({
  position: 'relative',
  width: '100%',
  height: '26rem',
  backgroundColor: colorVars.color.gray100,
  overflow: 'hidden',
  flexShrink: 0,
});

export const pageIndicator = style({
  position: 'absolute',
  top: '1.2rem',
  right: '1.2rem',
  width: '3.4rem',
  height: '2rem',
  borderRadius: '999px',
  backgroundColor: colorVars.color.gray999_30,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: colorVars.color.gray000,
  ...fontStyle('caption_r_11'),
  gap: '0.1rem',
});

export const pagination = style({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  left: '0.6rem',
  right: '0.6rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const navBtn = style({
  width: '3.6rem',
  height: '3.6rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const navIconFrame = style({
  width: '2.4rem',
  height: '2.4rem',
  borderRadius: '1.2rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const navIconFrameLeft = style({
  backgroundColor: colorVars.color.gray999_04,
});

export const navIconFrameRight = style({
  backgroundColor: colorVars.color.gray999_30,
});

// ─── 큐레이션 리스트 영역 ───

export const listContainer = style({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1 auto',
  minHeight: 0,
  padding: '2rem 1.6rem 0',
  overflowY: 'auto',
  overflowX: 'hidden',

  selectors: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
  scrollbarWidth: 'none',
});

export const titleSkeleton = style({
  ...skeletonBlock,
  width: '15.2rem',
  height: '1.6rem',
});

export const filterSection = style({
  display: 'flex',
  gap: '0.4rem',
  padding: '0.8rem 0',
  marginTop: '0.8rem',
  alignItems: 'center',
});

export const filterChipSkeleton = style({
  ...skeletonBlock,
  width: '6.9rem',
  height: '3.6rem',
  borderRadius: '999px',
  flexShrink: 0,
});

// ─── 상품 카드 그리드 ───

export const gridBox = style({
  width: '100%',
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  columnGap: '1.1rem',
  rowGap: 0,
  justifyContent: 'space-between',
  justifyItems: 'start',
  paddingBottom: '2rem',
  marginTop: '0.8rem',
});

export const cardWrapper = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
});

export const cardImgSkeleton = style({
  ...skeletonBlock,
  width: '100%',
  aspectRatio: '1 / 1',
  borderRadius: '0.8rem',
});

export const cardInfoWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
  padding: '0.6rem 0.2rem 2rem',
});

export const cardBrandSkeleton = style({
  ...skeletonBlock,
  width: '100%',
  height: '1.1rem',
});

export const cardNameSkeleton = style({
  ...skeletonBlock,
  width: '100%',
  height: '3.36rem',
});

export const cardPriceWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3rem',
  width: '8.3rem',
});

export const cardOriginalPriceSkeleton = style({
  ...skeletonBlock,
  width: '100%',
  height: '1.1rem',
});

export const cardDiscountPriceSkeleton = style({
  ...skeletonBlock,
  width: '100%',
  height: '1.5rem',
});
