import { style } from '@vanilla-extract/css';

import { PRODUCT_BOTTOM_SHEET_COLLAPSED_HEIGHT } from '@pages/home/constants/productTab';

import { colorVars } from '@styles/tokens/color.css';
import { unitVars } from '@styles/tokens/unit.css';
import { zIndex } from '@styles/tokens/zIndex';

// 플로팅 스크롤-탑 버튼은 바텀시트 collapsed 높이 바로 위에 위치 (높이 상수는 productTab.ts 단일 출처)
const PRODUCT_SCROLL_TOP_FLOATING_BOTTOM = `calc(${PRODUCT_BOTTOM_SHEET_COLLAPSED_HEIGHT} + 1.2rem)`;

export const section = style({
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  width: '100%',
});

export const searchHeader = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  padding: `${unitVars.unit.gapPadding['100']} ${unitVars.unit.gapPadding['000']}`,
  width: '100%',
});

export const stickyHeader = style({
  position: 'fixed',
  zIndex: zIndex.navigation,
  top: 'env(safe-area-inset-top, 0px)',
  margin: '0 auto',
  background: colorVars.color.bg.primary,
  width: '100%',
  minWidth: unitVars.unit.dimension.wMin,
  maxWidth: unitVars.unit.dimension.wMax,
});

export const stickySearchBarWrap = style({
  transform: 'translateY(-0.8rem)',
  transition: 'max-height 360ms ease, opacity 360ms ease, transform 360ms ease',
  opacity: 0,
  maxHeight: 0,
  overflow: 'hidden',
});

export const stickySearchBarWrapVisible = style({
  transform: 'translateY(0)',
  opacity: 1,
  maxHeight: '6.4rem',
});

export const searchBarContainer = style({
  boxSizing: 'border-box',
  padding: `${unitVars.unit.gapPadding['200']} ${unitVars.unit.gapPadding['500']}`,
  width: '100%',
});

export const filterList = style({
  boxSizing: 'border-box',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  overflow: 'hidden',
});

export const filterScroll = style({
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  gap: unitVars.unit.gapPadding['100'],
  padding: `${unitVars.unit.gapPadding['200']} ${unitVars.unit.gapPadding['500']}`,
  width: '100%',
  minWidth: 0,
  maxWidth: '100%',
  overflowX: 'auto',
  overflowY: 'hidden',
  overscrollBehaviorX: 'contain',
  scrollbarWidth: 'none',
  whiteSpace: 'nowrap',
  msOverflowStyle: 'none',
  selectors: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
});

export const productList = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: unitVars.unit.gapPadding['200'],
  padding: `${unitVars.unit.gapPadding['200']} ${unitVars.unit.gapPadding['500']}`,
  width: '100%',
});

export const productListFallback = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  padding: unitVars.unit.gapPadding['000'],
  width: '100%',
});

export const productListState = style({
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
});

export const recommendDivider = style({
  margin: 0,
  backgroundColor: colorVars.color.border.tertiary,
  height: '0.8rem',
});

export const scrollTopFloatingLayer = style({
  boxSizing: 'border-box',
  position: 'fixed',
  zIndex: zIndex.sticky,
  bottom: PRODUCT_SCROLL_TOP_FLOATING_BOTTOM,
  left: '50%',
  display: 'flex',
  justifyContent: 'flex-end',
  transform: 'translateX(-50%)',
  pointerEvents: 'none',
  paddingRight: unitVars.unit.gapPadding['500'],
  width: '100%',
  minWidth: unitVars.unit.dimension.wMin,
  maxWidth: unitVars.unit.dimension.wMax,
});

export const scrollTopFloatingWrap = style({
  boxSizing: 'border-box',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transform: 'translateY(0.8rem)',
  transition: 'opacity 240ms ease, transform 240ms ease',
  opacity: 0,
  border: `1px solid ${colorVars.color.border.secondary}`,
  borderRadius: unitVars.unit.radius['full'],
  backgroundColor: colorVars.color.fill.inverse,
  pointerEvents: 'none',
  width: '4rem',
  height: '4rem',
});

export const scrollTopFloatingButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  width: '100%',
  height: '100%',
});

export const scrollTopFloatingWrapVisible = style({
  transform: 'translateY(0)',
  opacity: 1,
  pointerEvents: 'auto',
});
