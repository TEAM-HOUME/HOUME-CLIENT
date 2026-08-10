import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { colorVars } from '@styles/tokens/color.css';
import {
  pressInteraction,
  sheetSlideInteraction,
} from '@styles/tokens/interaction/presets';
import { transition } from '@styles/tokens/interaction/utils';
import { unitVars } from '@styles/tokens/unit.css';
import { zIndex } from '@styles/tokens/zIndex';

// 최소화 시 actionRow가 접히는 트랜지션 (패널 height 슬라이드와 동일 duration/easing)
// transform은 쓰지 않음 — translateY(%)가 애니메이션 중인 높이에 종속돼 버튼이 출렁이므로 maxHeight+opacity만 사용
const collapseTransition = [
  transition('max-height'),
  transition('opacity'),
].join(', ');
// dim과 바텀시트를 동일한 모바일 프레임 폭으로 맞추기 위한 공통 폭 제한
const mobileFrame = style({
  width: '100%',
  minWidth: unitVars.unit.dimension.wMin,
  maxWidth: unitVars.unit.dimension.wMax,
});

// 화면 전체를 차지하는 컨테이너, 자식(바텀시트)을 화면 하단(flex-end)에 붙이는 역할
// 바텀시트의 위치를 잡아주는 레이아웃 프레임
export const viewportLayer = style({
  position: 'fixed',
  zIndex: zIndex.sheet,
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-end',
});

// 모바일 콘텐츠 영역에만 dim을 씌우는 오버레이(데스크탑/모바일 환경 모두)
export const overlay = style([
  mobileFrame,
  {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: colorVars.color.fill.dimSecondary,
    // pointerEvents는 BottomSheetBase에서 backgroundInteractable prop에 따라 inline으로 제어
  },
]);

// 모바일 프레임 폭으로 panel을 감싸는 컨테이너
// ::after: 모바일 height 전환 중 시트 하단이 순간 뷰포트 바닥에서 떠 뒷배경이 비치는 것 방지 —
// 패널 배경색을 시트 아래(뷰포트 밖)로 연장해 그 순간 갭을 가림
export const content = style([
  mobileFrame,
  {
    position: 'relative',
    outline: 'none',
    selectors: {
      '&::after': {
        position: 'absolute',
        top: '100%',
        right: 0,
        left: 0,
        backgroundColor: colorVars.color.bg.primary,
        pointerEvents: 'none',
        height: '6rem',
        content: '""',
      },
    },
  },
]);

// 스크린리더용 제목을 시각적으로만 숨기는 역할
export const srOnlyTitle = style({
  position: 'absolute',
  margin: '-0.1rem',
  border: 0,
  padding: 0,
  width: '0.1rem',
  height: '0.1rem',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
});

// 헤더, 본문, 액션 영역을 감싸는 바텀시트 패널 본체
// transform: open/close transition (BottomSheetBase 소유)
// height: expanded/collapsed/dragging (DragHandleBottomSheet 소유)
export const panel = recipe({
  base: {
    display: 'flex',
    flexDirection: 'column',
    transition: sheetSlideInteraction,
    willChange: 'transform, height',
    borderTopLeftRadius: unitVars.unit.radius['700'],
    borderTopRightRadius: unitVars.unit.radius['700'],
    boxShadow: `0 -0.4rem 2rem 0 ${colorVars.color.shadow.bottomSheet}`,
    backgroundColor: colorVars.color.bg.primary,
    width: '100%',
    maxHeight: 'calc(100dvh - 10.4rem)',
    overflow: 'hidden',
    overscrollBehavior: 'contain',
    WebkitTapHighlightColor: 'transparent',
  },
  variants: {
    headerType: {
      // 핸들이 패널 최상단에 붙고(상단 padding 0) 하단 여백 8px, 핸들↔시트본문 간격은 dragHeader padding이 담당(gap 0)

      dragHandle: {
        gap: unitVars.unit.gapPadding['000'],
        padding: `${unitVars.unit.gapPadding['000']} ${unitVars.unit.gapPadding['000']} ${unitVars.unit.gapPadding['200']}`,
      },
      close: {
        gap: unitVars.unit.gapPadding['200'],
        padding: `${unitVars.unit.gapPadding['200']} ${unitVars.unit.gapPadding['000']} ${unitVars.unit.gapPadding['600']}`,
      },
    },
  },
  defaultVariants: {
    headerType: 'close',
  },
});

// drag handle 타입에서 상단 핸들을 가운데 배치하는 헤더
// 시각적 핸들 바보다 큰 영역(padding 포함)을 차지하면서 이 요소 자체가 button →
// 모바일에서 손가락 hit이 안정적이게 됨 (시각 바는 child element가 가운데 표시)
export const dragHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'grab',
  touchAction: 'none',
  padding: `${unitVars.unit.gapPadding['300']} ${unitVars.unit.gapPadding['200']}`,
  width: '100%',
  selectors: {
    '&:active': {
      cursor: 'grabbing',
    },
  },
});

// 드래그 핸들의 *시각적* 바 — hit area는 부모 dragHeader(button)가 담당
export const dragHandleButton = style({
  display: 'inline-block',
  border: 0,
  borderRadius: unitVars.unit.radius.full,
  backgroundColor: colorVars.color.border.primary,
  padding: 0,
  width: '3.5rem',
  height: '0.4rem',
});

// close 타입에서 제목과 닫기 버튼을 배치하는 헤더
export const closeHeader = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  touchAction: 'none',
  padding: unitVars.unit.gapPadding['200'],
  width: '100%',
  height: '4.8rem',
});

// close 타입 제목을 헤더 왼쪽(FilterSheet)/중앙(FloorPlanSheet)에 고정하는 슬롯
export const titleSlot = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
  },
  variants: {
    align: {
      center: {
        position: 'absolute',
        inset: 0,
        justifyContent: 'center',
        pointerEvents: 'none',
      },
      left: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingLeft: unitVars.unit.gapPadding['400'],
      },
    },
  },
});

// 우측 상단 닫기 액션 버튼
export const closeButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...pressInteraction(0.95),
  border: 0,
  background: 'transparent',
  padding: unitVars.unit.gapPadding['300'],
  width: '4.8rem',
  height: '4.8rem',
});

// 본문 콘텐츠와 하단 버튼 감싸는 column 래퍼
// 본문↔버튼 간격(gap)이 헤더 타입/펼침 상태별 디자인이 달라 variant로 분기
// - close: 20px 고정
// - dragHandle: collapsed 8px(컴팩트) / expanded 20px(여유) — compoundVariants에서 지정
export const body = recipe({
  base: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: `${unitVars.unit.gapPadding['000']} ${unitVars.unit.gapPadding['600']}`,
    width: '100%',
    height: '100%',
    minHeight: 0,
  },
  variants: {
    headerType: {
      dragHandle: {},
      close: { gap: unitVars.unit.gapPadding['500'] },
    },
    expanded: {
      true: {},
      false: {},
    },
    minimized: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    {
      variants: { headerType: 'dragHandle', expanded: false },
      style: { gap: unitVars.unit.gapPadding['200'] },
    },
    {
      variants: { headerType: 'dragHandle', expanded: true },
      style: { gap: unitVars.unit.gapPadding['500'] },
    },
    // 최소화 시 접힌 버튼 자리에 남는 gap 제거 (썸네일이 핸들 바로 아래 붙도록)
    {
      variants: { headerType: 'dragHandle', minimized: true },
      style: { gap: unitVars.unit.gapPadding['000'] },
    },
  ],
  defaultVariants: {
    headerType: 'close',
    expanded: false,
    minimized: false,
  },
});

// contentSlot(바텀시트 내부의 실질적인 contents 영역)이 스크롤되도록 하는 슬롯
// touch-action은 BottomSheetBase에서 contentScrollable에 따라 inline으로 지정
// (collapsed=none: 뒷배경 스크롤 누수 방지 / scrollable=pan-y: native 세로 스크롤 허용)
export const contentSlot = style({
  width: '100%',
  minHeight: 0,
  overflow: 'auto',
  overscrollBehavior: 'contain',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  WebkitOverflowScrolling: 'touch',
  selectors: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
});

// 버튼 래퍼 row
// minimized(스크롤 다운)일 때 maxHeight+opacity로 접혀서 사라짐
// base maxHeight는 버튼 높이(2XL=5.6rem) 바로 위로 두어 collapse/reveal 타이밍을 패널 전환과 맞춤
// overflow:hidden은 minimized일 때만 적용 (close 타입 버튼 포커스 링 클립 방지)
export const actionRow = recipe({
  base: {
    display: 'flex',
    alignItems: 'stretch',
    gap: unitVars.unit.gapPadding['200'],
    transition: collapseTransition,
    width: '100%',
    maxHeight: '6rem',
  },
  variants: {
    minimized: {
      true: {
        opacity: 0,
        pointerEvents: 'none',
        maxHeight: 0,
        overflow: 'hidden',
      },
      false: {},
    },
  },
  defaultVariants: {
    minimized: false,
  },
});

// secondary 버튼이 자기 너비를 유지하도록 감싸는 슬롯
export const secondaryActionSlot = style({
  display: 'flex',
  flexShrink: 0,
});

// primary 버튼이 남은 가로 공간을 채우도록 감싸는 슬롯
export const primaryActionSlot = style({
  display: 'flex',
  flex: 1,
  width: '100%',
  minWidth: 0,
});
