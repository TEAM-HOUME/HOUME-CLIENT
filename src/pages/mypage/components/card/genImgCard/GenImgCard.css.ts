import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { pressTransformInteraction } from '@styles/tokens/interaction/presets';
import { unitVars } from '@styles/tokens/unit.css';

export const textContainer = style({
  display: 'flex',
  justifyContent: 'space-between',
  gap: unitVars.unit.gapPadding['200'],
  cursor: 'pointer',
  width: '100%',
});

export const headingText = style({
  display: 'block',
  ...fontVars.font.title_sb_15,
  flex: 1,
  padding: `${unitVars.unit.gapPadding['000']} ${unitVars.unit.gapPadding['100']}`,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: colorVars.color.text.primary,
});

export const imgContainer = style({
  aspectRatio: '166 / 111',
  position: 'relative',
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  border: 0,
  borderRadius: unitVars.unit.radius['300'],
  cursor: 'pointer',
  width: '100%',
  overflow: 'hidden',
});

// wrapper는 textContainer/imgContainer 클래스 문자열을 :has()에서 참조
// 두 스타일 선언 이후에 배치해야 초기화 순서 문제 발생 X
export const wrapper = style({
  display: 'flex',
  flexDirection: 'column',
  gap: unitVars.unit.gapPadding['200'],
  transition: pressTransformInteraction,
  padding: `${unitVars.unit.gapPadding['000']} ${unitVars.unit.gapPadding['500']}`,
  width: '100%',
  selectors: {
    [`&:has(${imgContainer}:active)`]: {
      transform: 'scale(0.97)',
    },
    [`&:has(${textContainer}:active):not(:has(button:active))`]: {
      transform: 'scale(0.97)',
    },
  },
});

export const cardImg = recipe({
  base: {
    objectFit: 'cover',
    width: '100%',
    height: '100%',
  },
  variants: {
    mirrored: {
      true: {
        transform: 'scaleX(-1)',
      },
    },
  },
  defaultVariants: {
    mirrored: false,
  },
});

// 가로 스크롤되는 상품 카드 리스트 (list 타입 카드 하단)
export const listCardContainer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: unitVars.unit.gapPadding['200'],
  marginRight: `calc(-1 * ${unitVars.unit.gapPadding['500']})`, // 스크롤시
  marginLeft: `calc(-1 * ${unitVars.unit.gapPadding['500']})`,

  padding: `${unitVars.unit.gapPadding['100']} ${unitVars.unit.gapPadding['500']}`,
  width: `calc(100% + 2 * ${unitVars.unit.gapPadding['500']})`,
  overflowX: 'auto',
  scrollbarWidth: 'none',

  whiteSpace: 'nowrap',
  msOverflowStyle: 'none',

  selectors: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
});
