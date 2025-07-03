import { globalStyle } from '@vanilla-extract/css';
import { colorVars } from '@styles/tokens/color.css';
import { fontVars } from '@styles/tokens/font.css';
import '@/shared/styles/fontFace.css';

globalStyle('html, body', {
  fontFamily: fontVars.family.pretendard,
  backgroundColor: colorVars.color.gray050,
  color: colorVars.color.gray999,
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  overflowWrap: 'break-word',
  minHeight: '100%',
});
