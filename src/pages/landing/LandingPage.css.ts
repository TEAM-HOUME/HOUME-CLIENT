import { style } from '@vanilla-extract/css';

import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import { landingBgInteraction } from '@styles/tokens/interaction/presets';
import { unitVars } from '@styles/tokens/unit.css';
export const page = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  // 배경 이미지 로드 전 단색. 텍스트가 흰색이므로 배경은 gray900(어두운 회색)
  backgroundColor: colorVars.color.gray900,
  padding: `${unitVars.unit.gapPadding['300']} ${unitVars.unit.gapPadding['000']}`,
  width: '100%',
  minHeight: '100vh',
  overflow: 'hidden',
});

export const backgroundImage = style({
  position: 'absolute',
  zIndex: 0,
  inset: 0,
  transition: landingBgInteraction,
  opacity: 0,
  objectFit: 'cover',
  // 모든 배경 이미지를 겹쳐두고 현재 이미지만 opacity 1로 올려 dissolve(크로스페이드). 리마운트 없음.
  width: '100%',
  height: '100%',
});

export const backgroundImageVisible = style({
  zIndex: 1,
  opacity: 1,
});

export const mainSection = style({
  position: 'relative',
  zIndex: 2,
  display: 'flex',
  flex: '1 0 0',
  flexDirection: 'column',
  alignItems: 'center',
  alignSelf: 'stretch',
  gap: unitVars.unit.gapPadding['000'],
  padding: `${unitVars.unit.gapPadding['400']} ${unitVars.unit.gapPadding['500']}`,
});

export const contentBlock = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  alignSelf: 'stretch',
  gap: unitVars.unit.gapPadding['700'],
  padding: `${unitVars.unit.gapPadding['900']} ${unitVars.unit.gapPadding['000']}`,
});

export const textContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  alignSelf: 'stretch',
  justifyContent: 'center',
  gap: unitVars.unit.gapPadding['300'],
  padding: `${unitVars.unit.gapPadding['000']}`,
});

export const title = style({
  ...fontVars.font.title_sb_24,
  textAlign: 'center',
  color: colorVars.color.text.inverse,
});

export const text = style({
  ...fontVars.font.body_r_14,
  textAlign: 'center',
  color: colorVars.color.text.inverseSecondary,
});
