import * as styles from './FloorCard.css.ts';

interface FloorPlanItemProps extends React.ComponentProps<'div'> {
  src: string;
  selected?: boolean;
}

const FloorPlanItem = ({ src, selected = false }: FloorPlanItemProps) => {
  return (
    <div className={`${styles.container} ${selected ? styles.selected : ''}`}>
      <img
        src={src}
        className={styles.floorimg}
        alt="카드 이미지"
        crossOrigin="anonymous"
      />
    </div>
  );
};

export default FloorPlanItem;
