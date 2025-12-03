import { style, styleVariants } from '@vanilla-extract/css';

import { fontStyle } from '@/shared/styles/fontStyle';
import { animationTokens } from '@/shared/styles/tokens/animation.css';
import { zIndex } from '@/shared/styles/tokens/zIndex';

import { colorVars } from '@styles/tokens/color.css';

export const filterSection = style({
  display: 'flex',
  gap: '0.4rem',
  padding: '0.8rem 0',
  alignItems: 'center',
  width: '100%',
  minWidth: '34.3rem',
  backgroundColor: colorVars.color.gray000,
  overflow: 'hidden',

  position: 'sticky',
  top: 0,
  zIndex: zIndex.sticky,

  overflowX: 'auto',
  whiteSpace: 'nowrap',

  '::-webkit-scrollbar': {
    display: 'none',
  },
  scrollbarWidth: 'none', // Firefox
  msOverflowStyle: 'none', // IE and Edge
});

export const scrollContentBase = style({
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
  maxHeight: '52rem',
  overscrollBehavior: 'contain', // 내부 스크롤 - 상위 시트 간 드래그 간섭 완화

  selectors: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
  scrollbarWidth: 'none', // Firefox
  msOverflowStyle: 'none', // IE and Edge
});

export const scrollContentArea = styleVariants({
  mid: { height: '29rem' },
  expanded: { height: '52rem' },
});

export const headerText = style({
  ...fontStyle('title_m_16'),
  color: colorVars.color.gray900,
  marginTop: '0.8rem',
});

export const curationSection = style({
  display: 'flex',
  gap: '1.2rem',
  marginTop: '1.6rem',
  flex: 1,
});

export const gridbox = style({
  width: '100%',
  height: 'fit-content',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(16.6rem, 1fr))',
  columnGap: '1.1rem',
  justifyItems: 'center',
});

export const statusContainer = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  paddingBottom: '4.5rem',
  gap: '0.8rem',
  textAlign: 'center',
  color: colorVars.color.gray500,
});

export const statusMessage = style({
  ...fontStyle('body_m_14'),
  color: colorVars.color.gray600,
});

export const statusMessageShimmer = style({
  ...fontStyle('body_m_14'),
  background: `linear-gradient(
    90deg,
    ${colorVars.color.gray600} 0%,
    ${colorVars.color.gray400} 50%,
    ${colorVars.color.gray600} 100%
  )`,
  backgroundSize: '200% 100%',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  animation: `${animationTokens.skeletonWave} 2s linear infinite`,
});

export const statusSubMessage = style({
  // 상태 안내 보조 메시지에 캡션_regular 12 적용
  ...fontStyle('caption_r_12'),
  color: colorVars.color.gray400,
});

export const statusButton = style({
  marginTop: '0.4rem',
  padding: '0.8rem 1.6rem',
  borderRadius: '999px',
  border: '1px solid',
  borderColor: colorVars.color.gray300,
  backgroundColor: colorVars.color.gray000,
  // 상태 안내 버튼 텍스트에 캡션_medium 12 적용
  ...fontStyle('caption_m_12'),
  color: colorVars.color.gray600,
});

export const loadingDots = style({
  display: 'inline-flex',
  gap: '0.3rem',
  marginLeft: '0.4rem',
});

export const dot = style({
  width: '0.4rem',
  height: '0.4rem',
  borderRadius: '50%',
  backgroundColor: colorVars.color.gray500,
  animation: `${animationTokens.dotsBounce} 1.4s ease-in-out infinite`,

  selectors: {
    '&:nth-child(1)': { animationDelay: '0s' },
    '&:nth-child(2)': { animationDelay: '0.2s' },
    '&:nth-child(3)': { animationDelay: '0.4s' },
  },
});
