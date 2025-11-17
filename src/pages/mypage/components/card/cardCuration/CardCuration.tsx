import CurationButton from '@/pages/mypage/components/button/curationButton/CurationButton';

import CardImageUrl from '@assets/images/cardExImg.svg?url';

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
      <div className={styles.cardImage} onClick={onCurationClick}>
        {imageUrl ? (
          <img src={imageUrl} alt="생성된 이미지" className={styles.image} />
        ) : (
          <img src={CardImageUrl} alt="기본 이미지" className={styles.image} />
        )}
      </div>
      <CurationButton onClick={onCurationClick} />
    </div>
  );
};

export default CardCurationSection;
