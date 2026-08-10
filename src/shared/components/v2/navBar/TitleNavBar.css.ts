import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { unitVars } from '@styles/tokens/unit.css';
import { zIndex } from '@styles/tokens/zIndex';

const NAV_BAR_CONTENT_HEIGHT = '4.8rem';
const SAFE_AREA_INSET_TOP = 'env(safe-area-inset-top, 0px)';

export const container = recipe({
  base: {
    boxSizing: 'border-box',
    zIndex: zIndex.navBar,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SAFE_AREA_INSET_TOP,
    paddingRight: unitVars.unit.gapPadding['400'],
    paddingLeft: unitVars.unit.gapPadding['300'],
    width: '100%',
    minWidth: unitVars.unit.dimension.wMin,
    maxWidth: unitVars.unit.dimension.wMax,
    height: `calc(${NAV_BAR_CONTENT_HEIGHT} + ${SAFE_AREA_INSET_TOP})`,
  },
  variants: {
    placement: {
      /** 일반 페이지: 문서 흐름 + 상단 고정 */
      sticky: {
        position: 'sticky',
        top: 0,
      },
      /** 풀블리드 콘텐츠 위 오버레이(부모는 `position: relative` 권장) */
      overContent: {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        marginRight: 'auto',
        marginLeft: 'auto',
      },
    },
    background: {
      transparent: {
        backgroundColor: 'transparent',
      },
      primary: {
        backgroundColor: colorVars.color.bg.primary,
      },
      /** 풀블리드 이미지 위 오버레이용 상단 그라데이션 (grad/navBar) — 뒤로가기 아이콘 가시성 확보 */
      gradient: {
        background:
          'linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.15) 39.71%, rgba(0, 0, 0, 0) 100%)',
      },
    },
  },
  defaultVariants: {
    placement: 'sticky',
    background: 'primary',
  },
});

export const leftSlot = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'flex-start',
  paddingRight: unitVars.unit.gapPadding['300'],
});

export const rightSlot = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'flex-end',
  paddingLeft: unitVars.unit.gapPadding['400'],
});

/** TextButton 레이아웃만 보정 (타이포·컬러·인터랙션은 TextButton 기본) */
export const backButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 0,
  background: 'transparent',
  color: colorVars.color.text.tertiary,
  ...fontVars.font.title_r_15,
});

export const label = style({
  padding: `${unitVars.unit.gapPadding['000']} ${unitVars.unit.gapPadding['100']}`,
});

export const title = style({
  position: 'absolute',
  top: `calc(${SAFE_AREA_INSET_TOP} + ${NAV_BAR_CONTENT_HEIGHT} / 2)`,
  left: '50%',
  transform: 'translate(-50%, -50%)',
  margin: 0,
  pointerEvents: 'none',
  maxWidth: '70%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: colorVars.color.text.primary,
  ...fontVars.font.title_m_16,
});
