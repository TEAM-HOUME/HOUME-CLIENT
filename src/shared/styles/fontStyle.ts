import { fontVars } from '@styles/tokens/font.css';

type FontKeys = Exclude<keyof typeof fontVars, 'family'>;

export const fontStyle = (key: FontKeys) => {
  const style = fontVars[key];
  if (!style) throw new Error(`Invalid font key: ${key}`);

  return {
    fontFamily: fontVars.family.pretendard,
    fontSize: style.size,
    fontWeight: style.weight,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
  };
};
