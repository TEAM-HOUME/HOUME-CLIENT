import { useState } from 'react';

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
  const [isLoaded, setIsLoaded] = useState(false); // 이미지 로드 완료 여부
  const imgSrc = imageUrl || CardImageUrl;

  return (
    <div className={styles.cardCurationContainer}>
      <div className={styles.cardImage} onClick={onCurationClick}>
        {/* 이미지 로드 완료 전에는 skeleton, 완료 시 실제 이미지 렌더링 */}
        {!isLoaded && <div className={styles.skeleton} />}
        <img
          src={imgSrc}
          alt={imageUrl ? '생성된 이미지' : '기본 이미지'}
          className={styles.image({ loaded: isLoaded })}
          onLoad={() => setIsLoaded(true)}
          crossOrigin="anonymous"
        />
      </div>
      <CurationButton onClick={onCurationClick} />
    </div>
  );
};

export default CardCurationSection;
