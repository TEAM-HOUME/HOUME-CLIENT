import CurationButton from '@/pages/mypage/components/button/curationButton/CurationButton';

import CardImage from '@assets/images/cardExImg.svg?react';

import * as styles from './CardCuration.css';

interface CardCurationSectionProps {
  imageUrl?: string;
  onCurationClick?: () => void;
}

const CardCurationSection = ({
  imageUrl,
  onCurationClick,
}: CardCurationSectionProps) => {
  return (
    <div className={styles.cardCurationContainer}>
      <div className={styles.cardImage}>
        {imageUrl ? (
          <img src={imageUrl} alt="생성된 이미지" className={styles.image} />
        ) : (
          <CardImage />
        )}
      </div>
      <CurationButton onClick={onCurationClick} />
    </div>
  );
};

export default CardCurationSection;
