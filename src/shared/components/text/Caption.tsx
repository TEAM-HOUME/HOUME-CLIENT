// Caption.tsx
import { captionBox, textVariants } from './Caption.css';

interface CaptionProps {
  code: string;
  option: string;
}

const Caption = ({ code, option }: CaptionProps) => {
  return (
    <div className={captionBox}>
      <span className={textVariants.strong}>{code}</span>
      <span className={textVariants.normal}>을 선택하면</span>
      <span className={textVariants.highlight}>{option}</span>
      <span className={textVariants.normalSmall}>
        이(가) 이미지에 포함돼요.
      </span>
    </div>
  );
};

export default Caption;
