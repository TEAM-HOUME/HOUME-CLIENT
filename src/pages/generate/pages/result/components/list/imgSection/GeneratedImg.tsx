import type { ResultImageMeta } from '@pages/generate/pages/result/types';

import OptimizedImage from '@components/image/OptimizedImage';
import { openImageZoom } from '@components/imageZoom/openImageZoom';

import * as styles from './GeneratedImg.css';

export interface GeneratedImgListProps {
  /** 단일 생성 이미지 */
  image: ResultImageMeta;
}

/**
 * 목록형 결과
 */
const GeneratedImg = ({ image }: GeneratedImgListProps) => {
  const handleOpenZoom = () => {
    if (!image.imageUrl) return;
    openImageZoom({ src: image.imageUrl, isMirror: image.isMirror });
  };

  return (
    <div className={styles.container}>
      <div
        className={styles.listImageFrame}
        role="button"
        tabIndex={0}
        aria-label="생성된 이미지 확대해서 보기"
        onClick={handleOpenZoom}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpenZoom();
          }
        }}
      >
        <OptimizedImage
          src={image.imageUrl}
          alt=""
          placeholder="color"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className={styles.imgArea({ mirrored: image.isMirror })}
        />
      </div>
    </div>
  );
};

export default GeneratedImg;
