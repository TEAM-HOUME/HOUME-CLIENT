import * as style from './Caption.css';
import CaptionChip from './CaptionChip';

interface CaptionProps {
  code: string;
  option: string;
}

const Caption = ({ code, option }: CaptionProps) => {
  return (
    <div className={style.container}>
      <p className={style.textBox}>
        <CaptionChip text={code} stroke={true} />
        <span className={style.text}>을 선택하면</span>
      </p>
      <p className={style.textBox}>
        <CaptionChip text={option} />
        <span className={style.text}>이(가) 이미지에 포함돼요.</span>
      </p>
    </div>
  );
};

export default Caption;
