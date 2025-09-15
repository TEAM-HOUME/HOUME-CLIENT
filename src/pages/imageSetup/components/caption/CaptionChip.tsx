import * as styles from './CaptionChip.css';

interface CaptionChipProps {
  text: string;
  stroke?: boolean;
}

const CaptionChip = ({ text, stroke = false }: CaptionChipProps) => {
  return <div className={styles.captionChip({ stroke })}>{text}</div>;
};

export default CaptionChip;
