import * as styles from './CaptionChip.css';

interface CaptionChipProps {
  text: string;
  stroke?: boolean;
}

const CaptionChip = ({ text, stroke = false }: CaptionChipProps) => {
  return <span className={styles.captionChip({ stroke })}>{text}</span>;
};

export default CaptionChip;
