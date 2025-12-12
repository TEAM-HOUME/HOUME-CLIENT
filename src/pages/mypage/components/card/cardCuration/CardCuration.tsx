import { useEffect, useState } from 'react';

import CurationButton from '@/pages/mypage/components/button/curationButton/CurationButton';

import CardImageUrl from '@assets/images/cardExImg.svg?url';

import * as styles from './CardCuration.css';

interface CardCurationSectionProps {
  imageId: number;
  imageUrl?: string;
  isLoaded?: boolean;
  onImageLoad?: (imageId: number, imageUrl?: string) => void;
  onCurationClick?: () => void;
}

const CardCurationSection = ({
  imageId,
  imageUrl,
  isLoaded = false,
  onImageLoad,
  onCurationClick,
}: CardCurationSectionProps) => {
  const [localLoaded, setLocalLoaded] = useState(isLoaded); // 이미지 로드 완료 여부
  const imgSrc = imageUrl || CardImageUrl;

  useEffect(() => {
    if (isLoaded && !localLoaded) {
      setLocalLoaded(true);
    }
  }, [isLoaded, localLoaded]);

  const handleImageLoad = () => {
    if (!localLoaded) {
      setLocalLoaded(true);
    }
    onImageLoad?.(imageId, imageUrl);
  };

  return (
    <div className={styles.cardCurationContainer}>
      <div className={styles.cardImage} onClick={onCurationClick}>
        {/* 이미지 로드 완료 전에는 skeleton, 완료 시 실제 이미지 렌더링 */}
        {!localLoaded && <div className={styles.skeleton} />}
        <img
          src={imgSrc}
          alt={imageUrl ? '생성된 이미지' : '기본 이미지'}
          className={styles.image({ loaded: localLoaded })}
          onLoad={handleImageLoad}
          crossOrigin="anonymous"
        />
      </div>
      <CurationButton onClick={onCurationClick} />
    </div>
  );
};

export default CardCurationSection;
