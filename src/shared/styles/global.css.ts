import { globalStyle, createGlobalTheme } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import '@styles/tokens/interaction/tokens.css';
import { unitVars } from '@styles/tokens/unit.css';
import '@styles/reset.css';
import '@styles/fontFace.css';

/**
 * 프로젝트 글로벌 스타일 설정
 * reset.css.ts의 기본 초기화 위에 프로젝트 특화 스타일을 정의합니다.
 *
 * 주요 기능:
 * - 반응형 레이아웃 설정 (모바일 중심)
 * - 스크롤바 커스터마이징
 * - 앱 컨테이너 스타일링
 */

/* ===== 레이아웃 CSS 변수 정의 ===== */
/**
 * 반응형 레이아웃을 위한 전역 CSS 변수
 * 모바일 앱과 같은 고정 너비 레이아웃 구현
 * minWidth/maxWidth는 unit 토큰(dimension) 단일 소스 참조
 *
 * @property minWidth - unit.dimension.wMin (37.5rem)
 * @property maxWidth - unit.dimension.wMax (44rem)
 * @property height - 뷰포트 높이 (동적 뷰포트 단위 사용)
 */
export const layoutVars = createGlobalTheme(':root', {
  minWidth: unitVars.unit.dimension.wMin,
  maxWidth: unitVars.unit.dimension.wMax,
  height: '100dvh',
  titleNavBarHeight: '4.8rem',
});

/* ===== 앱 루트 컨테이너 ===== */
/**
 * React 앱의 최상위 컨테이너 설정
 * 전체 높이를 차지하며 수직 플렉스 레이아웃 적용
 * 하위 컴포넌트들이 플렉스 아이템으로 배치됨
 */
globalStyle('#root', {
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
});

/* ===== HTML 루트 설정 ===== */
/**
 * HTML 요소의 추가 설정
 * - 전체 높이 사용으로 body까지 높이 상속
 * - 스크롤바 숨김으로 모바일 앱 같은 UI 구현
 */
globalStyle('html', {
  // 모바일: 흰색. 동적 툴바(Safari/Edge)가 접힐 때 body(100dvh) 아래로 드러나는 영역이 html 배경이므로, 회색(gray100) 대신 앱 배경(흰색)과 맞춰 빈 공간이 보이지 않게 함
  backgroundColor: colorVars.color.gray000,
  height: '100%', // Firefox 스크롤바 숨김
  scrollbarWidth: 'none',
  '@media': {
    // 데스크탑 프레임(>=440px, body box-shadow 분기와 동일)에서만 회색 surround 유지
    '(min-width: 440px)': {
      backgroundColor: colorVars.color.gray100,
    },
  },
});

/**
 * Webkit 기반 브라우저 스크롤바 숨김
 * Chrome, Safari, Edge 등에서 적용
 */
globalStyle('html::-webkit-scrollbar', {
  display: 'none',
});

/* ===== Body 프로젝트 스타일 ===== */
/**
 * 앱의 메인 컨테이너 역할을 하는 body 스타일
 *
 * 타이포그래피:
 * - Pretendard 폰트 적용
 * - 폰트 스무딩으로 선명한 텍스트 렌더링
 * - 긴 단어 자동 줄바꿈
 *
 * 레이아웃:
 * - 모바일 중심 고정 너비 (375px ~ 440px)
 * - 가운데 정렬로 데스크톱에서도 모바일 뷰 유지
 * - 플렉스 컨테이너로 하위 요소 배치 관리
 *
 * 시각적 효과:
 * - 배경색과 텍스트 색상 설정
 * - 그림자 효과로 앱 영역 구분 (데스크톱에서 효과적)
 * - 부드러운 스크롤 애니메이션
 */
globalStyle('body', {
  display: 'flex',
  flexDirection: 'column',
  transition: 'box-shadow 0.3s ease',
  marginRight: 'auto',
  marginLeft: 'auto',
  boxShadow: 'none',
  backgroundColor: colorVars.color.gray000,
  minWidth: layoutVars.minWidth,
  maxWidth: layoutVars.maxWidth,
  minHeight: layoutVars.height,
  overflowWrap: 'break-word',
  scrollbarWidth: 'none',
  scrollBehavior: 'smooth',
  color: colorVars.color.gray999,
  fontFamily: fontVars.font.family.pretendard,
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  '@media': {
    '(min-width: 440px)': {
      boxShadow: '0px 32px 84px rgba(16, 18, 24, 0.22)',
    },
  },
});

/**
 * Body의 Webkit 스크롤바 숨김
 * 모바일 앱 같은 깔끔한 UI 구현
 */
globalStyle('body::-webkit-scrollbar', {
  display: 'none',
});

/* ===== 이미지 보호 설정 ===== */
/**
 * 모든 이미지 요소에 대한 사용자 상호작용 제한
 *
 * Best Practice:
 * - CSS만으로는 완전한 드래그 방지가 불가능
 * - 중요한 이미지는 개별적으로 draggable="false" HTML 속성 추가 권장
 * - 모바일 환경에서의 길게 누르기 메뉴도 방지
 */
globalStyle('img', {
  // 텍스트/이미지 선택 방지
  userSelect: 'none',
  WebkitUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',

  // 모바일 터치 콜아웃(길게 누르기 메뉴) 방지
  WebkitTouchCallout: 'none',

  // 이미지 하이라이트 방지
  WebkitTapHighlightColor: 'transparent',
});

/* ===== iOS Safari 터치 하이라이트 제거 ===== */
/**
 * iOS Safari에서 터치 시 나타나는 회색 하이라이트 박스 제거
 * 모든 인터랙티브 요소에 적용하여 네이티브 앱과 같은 UX 제공
 *
 * Best Practice:
 * - transparent 또는 rgba(0,0,0,0) 사용
 * - :focus 내부가 아닌 요소에 직접 적용
 * - 버튼, 링크, 터치 가능한 div 등 모든 인터랙티브 요소에 적용
 */
globalStyle(
  'a, button, input, textarea, select, div[onclick], div[role="button"], [tabindex]',
  {
    WebkitTapHighlightColor: 'transparent',
    // 필요 시 아웃라인도 제거 (접근성 고려하여 신중히 결정)
    // outline: 'none',
  }
);

/* ===== 추가 터치 최적화 ===== */
/**
 * 터치 장치에서의 사용자 경험 향상을 위한 추가 설정
 */
globalStyle('*', {
  // 터치 지연 제거 (300ms 탭 지연 방지)
  touchAction: 'manipulation',
});
